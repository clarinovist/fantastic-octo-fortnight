package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/email"
	"github.com/lesprivate/backend/shared/google"
	"github.com/lesprivate/backend/shared/jwt"
	"github.com/lesprivate/backend/shared/logger"
)

type UserService struct {
	config       *config.Config
	user         *repositories.UserRepository
	role         *repositories.RoleRepository
	student      *repositories.StudentRepository
	tutor        *repositories.TutorRepository
	jwt          *jwt.JWT
	email        email.EmailService
	notification *NotificationService
	redis        *infras.Redis
	googleOAuth  google.GoogleOAuthService
}

func NewUserService(
	c *config.Config,
	user *repositories.UserRepository,
	role *repositories.RoleRepository,
	student *repositories.StudentRepository,
	tutor *repositories.TutorRepository,
	emailSvc email.EmailService,
	notification *NotificationService,
	redis *infras.Redis,
	googleOAuth google.GoogleOAuthService,
) *UserService {
	// Initialize JWT service with config values
	jwtSvc := jwt.NewJWT(c.JWT.Key, c.JWT.ExpiresIn, c.JWT.RefreshExpiresIn)

	return &UserService{
		config:       c,
		user:         user,
		role:         role,
		student:      student,
		tutor:        tutor,
		jwt:          jwtSvc,
		email:        emailSvc,
		notification: notification,
		redis:        redis,
		googleOAuth:  googleOAuth,
	}
}

func (s *UserService) Register(ctx context.Context, req dto.RegisterRequest) (model.User, error) {
	// Check if user already exists
	existingUser, err := s.user.GetByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to check existing user")
		return model.User{}, Error(shared.MakeError(ErrInternalServer))
	}

	if existingUser != nil {
		logger.WarnCtx(ctx).Str("email", req.Email).Msg("user already exists")
		return model.User{}, Error(shared.MakeError(ErrBadRequest, "user with this email already exists"))
	}

	// Validate role exists in database
	role, err := s.role.GetByName(ctx, req.RoleName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.WarnCtx(ctx).Str("roleName", req.RoleName).Msg("role not found")
			return model.User{}, Error(shared.MakeError(ErrBadRequest, "invalid role specified"))
		}
		logger.ErrorCtx(ctx).Err(err).Str("roleName", req.RoleName).Msg("failed to validate role")
		return model.User{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to hash password")
		return model.User{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Create user
	user := model.User{
		ID:          uuid.New(),
		Name:        req.Name,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
		Password:    string(hashedPassword),
		LoginSource: model.LoginSourceEmail,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Create role-specific record based on role
	roleSpecificRecord, err := s.prepareRoleSpecificRecord(&user, req.RoleName)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("userID", user.ID.String()).
			Str("roleName", req.RoleName).
			Msg("failed to prepare role-specific record")
		return model.User{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Create user with role assignment and role-specific record in a single transaction
	if err = s.user.CreateWithRoleAndRecord(ctx, &user, role.ID, roleSpecificRecord); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("userID", user.ID.String()).
			Str("roleName", req.RoleName).
			Msg("failed to create user with role and record")
		return model.User{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Send verification email asynchronously (non-blocking)
	go func() {
		// Create a new context for the email operation to avoid cancellation
		emailCtx := context.Background()
		_ = s.notification.RegisterUser(emailCtx, user, *role)
	}()

	return user, nil
}

func (s *UserService) Login(ctx context.Context, req dto.LoginRequest) (dto.LoginResponse, error) {
	// Get user by email
	user, err := s.user.GetByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.WarnCtx(ctx).Str("email", req.Email).Msg("user not found during login")
			return dto.LoginResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid credentials"))
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to get user by email")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Verify password
	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		logger.WarnCtx(ctx).Str("email", req.Email).Msg("invalid password during login")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid credentials"))
	}

	if !user.VerifiedAt.Valid {
		logger.WarnCtx(ctx).Str("email", req.Email).Msg("user not verified during login")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrBadRequest, "user not verified"))
	}

	// Generate JWT token pair (access and refresh tokens)
	accessToken, refreshToken, accessExpiresAt, refreshExpiresAt, err := s.jwt.GenerateTokenPair(user.ID, user.Email, user.Name)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to generate JWT token pair")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	logger.InfoCtx(ctx).
		Str("userID", user.ID.String()).
		Str("email", user.Email).
		Msg("user logged in successfully")

	return dto.LoginResponse{
		ID:               user.ID,
		Name:             user.Name,
		Email:            user.Email,
		LoginSource:      user.LoginSource,
		AccessToken:      accessToken,
		RefreshToken:     refreshToken,
		TokenType:        "Bearer",
		ExpiresIn:        accessExpiresAt,
		RefreshExpiresIn: refreshExpiresAt,
	}, nil
}

func (s *UserService) RefreshToken(ctx context.Context, req dto.RefreshTokenRequest) (dto.RefreshTokenResponse, error) {
	// Validate the refresh token and extract claims
	claims, err := s.jwt.ValidateToken(req.RefreshToken)
	if err != nil {
		logger.WarnCtx(ctx).Err(err).Msg("invalid refresh token provided")
		return dto.RefreshTokenResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid refresh token"))
	}

	// Verify user still exists in database
	user, err := s.user.GetByEmail(ctx, claims.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.WarnCtx(ctx).Str("email", claims.Email).Msg("user not found during token refresh")
			return dto.RefreshTokenResponse{}, Error(shared.MakeError(ErrBadRequest, "user not found"))
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to get user during token refresh")
		return dto.RefreshTokenResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Ensure the user ID matches the token claims
	if user.ID != claims.UserID {
		logger.WarnCtx(ctx).
			Str("tokenUserID", claims.UserID.String()).
			Str("dbUserID", user.ID.String()).
			Msg("user ID mismatch during token refresh")
		return dto.RefreshTokenResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid token"))
	}

	// Generate new token pair
	accessToken, refreshToken, accessExpiresAt, refreshExpiresAt, err := s.jwt.GenerateTokenPair(user.ID, user.Email, user.Name)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to generate new token pair during refresh")
		return dto.RefreshTokenResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	logger.InfoCtx(ctx).
		Str("userID", user.ID.String()).
		Str("email", user.Email).
		Msg("token refreshed successfully")

	return dto.RefreshTokenResponse{
		AccessToken:      accessToken,
		RefreshToken:     refreshToken,
		TokenType:        "Bearer",
		ExpiresIn:        accessExpiresAt,
		RefreshExpiresIn: refreshExpiresAt,
	}, nil
}

// VerifyEmail verifies the email using the provided token
func (s *UserService) VerifyEmail(ctx context.Context, req dto.VerifyEmailRequest) (dto.LoginResponse, error) {
	// Create Redis key for verification token using the same format as generation
	redisKey := model.BuildCacheKey(model.EmailVerificationKey, req.Token)

	// Get user data from Redis
	userData, err := s.redis.Client.Get(ctx, redisKey).Result()
	if errors.Is(err, redis.Nil) {
		logger.WarnCtx(ctx).Str("token", req.Token).Msg("verification token not found or expired")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid or expired verification token"))
	}

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("token", req.Token).Msg("failed to get verification token from Redis")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Parse user data (format: "userID:email")
	parts := strings.Split(userData, ":")
	if len(parts) != 2 {
		logger.ErrorCtx(ctx).Str("token", req.Token).Str("userData", userData).Msg("invalid user data format in Redis")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	userIDStr, email := parts[0], parts[1]
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("userIDStr", userIDStr).Msg("failed to parse user ID from verification token")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Verify user exists in database
	user, err := s.user.GetByEmail(ctx, email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		logger.WarnCtx(ctx).Str("email", email).Msg("user not found during email verification")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrBadRequest, "user not found"))
	}

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("email", email).Msg("failed to get user during email verification")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Ensure user ID matches
	if user.ID != userID {
		logger.WarnCtx(ctx).
			Str("tokenUserID", userID.String()).
			Str("dbUserID", user.ID.String()).
			Msg("user ID mismatch during email verification")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid verification token"))
	}

	// Update user's verified_at timestamp in database
	verifiedAt := time.Now()
	if err := s.user.UpdateVerifiedAt(ctx, user.ID, verifiedAt); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("userID", user.ID.String()).
			Str("email", user.Email).
			Msg("failed to update user verified_at timestamp")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	// Delete the verification token from Redis
	if err := s.redis.Client.Del(ctx, redisKey).Err(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("token", req.Token).Msg("failed to delete verification token from Redis")
	}

	logger.InfoCtx(ctx).
		Str("userID", user.ID.String()).
		Str("email", user.Email).
		Str("token", req.Token).
		Msg("email verified successfully")

	// Generate JWT token pair (access and refresh tokens)
	accessToken, refreshToken, accessExpiresAt, refreshExpiresAt, err := s.jwt.GenerateTokenPair(user.ID, user.Email, user.Name)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to generate JWT token pair")
		return dto.LoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	return dto.LoginResponse{
		ID:               user.ID,
		Name:             user.Name,
		Email:            user.Email,
		LoginSource:      user.LoginSource,
		AccessToken:      accessToken,
		RefreshToken:     refreshToken,
		TokenType:        "Bearer",
		ExpiresIn:        accessExpiresAt,
		RefreshExpiresIn: refreshExpiresAt,
	}, nil
}

// GoogleLogin handles Google SSO authentication
func (s *UserService) GoogleLogin(ctx context.Context, req dto.GoogleLoginRequest) (dto.GoogleLoginResponse, error) {
	// Validate Google ID token and get user info
	googleUserInfo, err := s.googleOAuth.ValidateToken(ctx, req.IDToken)
	if err != nil {
		logger.WarnCtx(ctx).Err(err).Msg("failed to validate Google ID token")
		return dto.GoogleLoginResponse{}, Error(shared.MakeError(ErrUnauthorized))
	}

	// Check if user exists by email
	existingUser, err := s.user.GetByEmail(ctx, googleUserInfo.Email)
	isNewUser := false

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.ErrorCtx(ctx).Err(err).Str("email", googleUserInfo.Email).Msg("failed to check existing user during Google login")
		return dto.GoogleLoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	var user *model.User

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// User doesn't exist, create new user with verified_at set to now
		isNewUser = true

		if !req.RoleName.Valid {
			logger.WarnCtx(ctx).Msg("role name not provided during Google login")
			return dto.GoogleLoginResponse{}, Error(shared.MakeError(ErrBadRequest, "role name is required"))
		}

		// Determine role name to use - use provided roleName or default to "student"
		roleName := strings.TrimSpace(req.RoleName.String)

		// Get role for new Google user
		userRole, err := s.role.GetByName(ctx, roleName)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("roleName", roleName).Msg("failed to get role for Google user creation")
			return dto.GoogleLoginResponse{}, Error(shared.MakeError(ErrInternalServer))
		}

		// Create new user with Google info
		newUser := model.User{
			ID:          uuid.New(),
			Name:        googleUserInfo.Name,
			Email:       googleUserInfo.Email,
			PhoneNumber: "",
			Password:    "",
			LoginSource: model.LoginSourceGoogle,
			VerifiedAt:  null.TimeFrom(time.Now()),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		// Create role-specific record based on role
		roleSpecificRecord, err := s.prepareRoleSpecificRecord(&newUser, roleName)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("userID", newUser.ID.String()).
				Str("roleName", roleName).
				Msg("failed to prepare role-specific record for Google user")
			return dto.GoogleLoginResponse{}, Error(shared.MakeError(ErrInternalServer))
		}

		// Create user with role assignment and role-specific record in a single transaction
		if err = s.user.CreateWithRoleAndRecord(ctx, &newUser, userRole.ID, roleSpecificRecord); err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("email", googleUserInfo.Email).
				Str("roleName", roleName).
				Msg("failed to create Google user with role and record")
			return dto.GoogleLoginResponse{}, Error(shared.MakeError(ErrInternalServer))
		}

		user = &newUser

		go func() {
			if roleName == model.RoleNameTutor {
				s.notification.TutorNotificationUpdateProfile(ctx, *user)
			}
		}()

		logger.InfoCtx(ctx).
			Str("userID", user.ID.String()).
			Str("email", user.Email).
			Str("name", user.Name).
			Str("roleName", roleName).
			Msg("new user created via Google SSO")
	} else {
		// User exists, use existing user
		user = existingUser

		// Update verified_at if not already verified
		if !user.VerifiedAt.Valid {
			verifiedAt := time.Now()
			if err := s.user.UpdateVerifiedAt(ctx, user.ID, verifiedAt); err != nil {
				logger.ErrorCtx(ctx).Err(err).
					Str("userID", user.ID.String()).
					Str("email", user.Email).
					Msg("failed to update verified_at for existing Google user")
				// Don't fail the login for this, just log the error
			} else {
				user.VerifiedAt = null.TimeFrom(verifiedAt)
				logger.InfoCtx(ctx).
					Str("userID", user.ID.String()).
					Str("email", user.Email).
					Msg("updated verified_at for existing user via Google SSO")
			}
		}

		logger.InfoCtx(ctx).
			Str("userID", user.ID.String()).
			Str("email", user.Email).
			Msg("existing user logged in via Google SSO")
	}

	// Generate JWT token pair (access and refresh tokens)
	accessToken, refreshToken, accessExpiresAt, refreshExpiresAt, err := s.jwt.GenerateTokenPair(user.ID, user.Email, user.Name)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to generate JWT token pair for Google login")
		return dto.GoogleLoginResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	logger.InfoCtx(ctx).
		Str("userID", user.ID.String()).
		Str("email", user.Email).
		Bool("isNewUser", isNewUser).
		Msg("Google SSO login successful")

	return dto.GoogleLoginResponse{
		ID:               user.ID,
		Name:             user.Name,
		Email:            user.Email,
		LoginSource:      user.LoginSource,
		AccessToken:      accessToken,
		RefreshToken:     refreshToken,
		TokenType:        "Bearer",
		ExpiresIn:        accessExpiresAt,
		RefreshExpiresIn: refreshExpiresAt,
		IsNewUser:        isNewUser,
	}, nil
}

func (s *UserService) CheckUser(ctx context.Context, req dto.CheckUserRequest) (dto.CheckUserResponse, error) {
	// Validate Google ID token and get user info
	googleUserInfo, err := s.googleOAuth.ValidateToken(ctx, req.IDToken)
	if err != nil {
		logger.WarnCtx(ctx).Err(err).Msg("failed to validate Google ID token")
		return dto.CheckUserResponse{}, Error(shared.MakeError(ErrUnauthorized))
	}

	// Check if user exists by email
	_, err = s.user.GetByEmail(ctx, googleUserInfo.Email)
	isNewUser := false

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.ErrorCtx(ctx).Err(err).Str("email", googleUserInfo.Email).Msg("failed to check existing user during Google login")
		return dto.CheckUserResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		isNewUser = true
	}

	return dto.CheckUserResponse{
		Email:     googleUserInfo.Email,
		IsNewUser: isNewUser,
	}, nil
}

// ForgotPassword generates a password reset token and sends reset email
func (s *UserService) ForgotPassword(ctx context.Context, req dto.ForgotPasswordRequest) (dto.ForgotPasswordResponse, error) {
	user, err := s.user.GetByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.WarnCtx(ctx).Str("email", req.Email).Msg("user not found for password reset")
			return dto.ForgotPasswordResponse{
				Message: "If an account exists with this email, you will receive a password reset link shortly.",
			}, nil
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to get user by email")
		return dto.ForgotPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	token, resetLink, err := s.generatePasswordResetToken(ctx, user.ID, user.Email)
	if err != nil {
		logger.ErrorCtx(ctx).
			Err(err).
			Str("userID", user.ID.String()).
			Str("email", user.Email).
			Msg("failed to generate password reset token")
		return dto.ForgotPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	go func() {
		emailCtx := context.Background()
		if err := s.email.SendPasswordResetEmail(emailCtx, user.Email, resetLink); err != nil {
			logger.ErrorCtx(emailCtx).
				Err(err).
				Str("userID", user.ID.String()).
				Str("email", user.Email).
				Str("token", token).
				Msg("failed to send password reset email")
		}
	}()

	logger.InfoCtx(ctx).
		Str("userID", user.ID.String()).
		Str("email", user.Email).
		Msg("password reset email sent successfully")

	return dto.ForgotPasswordResponse{
		Message: "If an account exists with this email, you will receive a password reset link shortly.",
	}, nil
}

// ResetPassword resets user password using the provided token
func (s *UserService) ResetPassword(ctx context.Context, req dto.ResetPasswordRequest) (dto.ResetPasswordResponse, error) {
	redisKey := model.BuildCacheKey(model.PasswordResetKey, req.Token)

	userData, err := s.redis.Client.Get(ctx, redisKey).Result()
	if errors.Is(err, redis.Nil) {
		logger.WarnCtx(ctx).Str("token", req.Token).Msg("password reset token not found or expired")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid or expired reset token"))
	}

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("token", req.Token).Msg("failed to get reset token from Redis")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	parts := strings.Split(userData, ":")
	if len(parts) != 2 {
		logger.ErrorCtx(ctx).Str("token", req.Token).Str("userData", userData).Msg("invalid user data format in Redis")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	userIDStr, email := parts[0], parts[1]
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("userIDStr", userIDStr).Msg("failed to parse user ID from reset token")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	user, err := s.user.GetByEmail(ctx, email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		logger.WarnCtx(ctx).Str("email", email).Msg("user not found during password reset")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrBadRequest, "user not found"))
	}

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("email", email).Msg("failed to get user during password reset")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	if user.ID != userID {
		logger.WarnCtx(ctx).
			Str("tokenUserID", userID.String()).
			Str("dbUserID", user.ID.String()).
			Msg("user ID mismatch during password reset")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrBadRequest, "invalid reset token"))
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to hash new password")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	user.Password = string(hashedPassword)
	user.UpdatedAt = time.Now()

	if err := s.user.Update(ctx, user); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("userID", user.ID.String()).
			Str("email", user.Email).
			Msg("failed to update user password")
		return dto.ResetPasswordResponse{}, Error(shared.MakeError(ErrInternalServer))
	}

	if err := s.redis.Client.Del(ctx, redisKey).Err(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("token", req.Token).Msg("failed to delete reset token from Redis")
	}

	logger.InfoCtx(ctx).
		Str("userID", user.ID.String()).
		Str("email", user.Email).
		Msg("password reset successfully")

	return dto.ResetPasswordResponse{
		Message: "Password has been reset successfully. You can now login with your new password.",
	}, nil
}

// generatePasswordResetToken generates a password reset token and stores it in Redis
func (s *UserService) generatePasswordResetToken(ctx context.Context, userID uuid.UUID, email string) (string, string, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)

	key := model.BuildCacheKey(model.PasswordResetKey, token)

	userData := fmt.Sprintf("%s:%s", userID.String(), email)
	if err := s.redis.Client.Set(ctx, key, userData, 1*time.Hour).Err(); err != nil {
		return "", "", fmt.Errorf("failed to store reset token in Redis: %w", err)
	}

	resetLink := fmt.Sprintf("%s%s?token=%s", s.config.Frontend.BaseURL, s.config.Frontend.ResetPasswordPath, token)

	return token, resetLink, nil
}

// prepareRoleSpecificRecord prepares the role-specific record based on user role
// Returns the record to be created or nil if no record is needed
func (s *UserService) prepareRoleSpecificRecord(user *model.User, roleName string) (interface{}, error) {
	switch roleName {
	case "student":
		// Prepare student record
		student := &model.Student{
			UserID:    user.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			CreatedBy: uuid.NullUUID{UUID: user.ID, Valid: true},
		}
		return student, nil

	case "tutor":
		// Get a default location ID (first available location)
		defaultLocationID, err := uuid.Parse("0002cd1f-d7fd-487c-9702-9073bea4e2d6") // Using first location as default
		if err != nil {
			return nil, fmt.Errorf("failed to parse default location ID: %w", err)
		}

		// Prepare tutor record with proper default values
		tutor := &model.Tutor{
			UserID:        user.ID,
			Description:   "",
			ClassType:     model.AllClassType, // Default to "all" class type
			OnlineChannel: model.OnlineChannel{},
			Level:         null.StringFrom(string(model.TutorLevelGuru)),
			LocationID:    uuid.NullUUID{UUID: defaultLocationID, Valid: true}, // Default location, will be updated when tutor completes profile
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
			CreatedBy:     uuid.NullUUID{UUID: user.ID, Valid: true},
		}
		return tutor, nil
	default:
		// Unknown role, no additional record created
		return nil, nil
	}
}

// ChangePassword changes the user password
func (s *UserService) ChangePassword(ctx context.Context, userID uuid.UUID, req dto.ChangePasswordRequest) error {
	user, err := s.user.GetByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.WarnCtx(ctx).Str("userID", userID.String()).Msg("user not found during password change")
			return Error(shared.MakeError(ErrBadRequest, "user not found"))
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to get user during password change")
		return Error(shared.MakeError(ErrInternalServer))
	}

	// Verify old password
	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		logger.WarnCtx(ctx).Str("userID", userID.String()).Msg("invalid old password during password change")
		return Error(shared.MakeError(ErrBadRequest, "invalid old password"))
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to hash new password")
		return Error(shared.MakeError(ErrInternalServer))
	}

	user.Password = string(hashedPassword)
	user.UpdatedAt = time.Now()

	if err := s.user.Update(ctx, user); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("userID", userID.String()).
			Msg("failed to update user password")
		return Error(shared.MakeError(ErrInternalServer))
	}

	logger.InfoCtx(ctx).
		Str("userID", userID.String()).
		Msg("password changed successfully")

	return nil
}
