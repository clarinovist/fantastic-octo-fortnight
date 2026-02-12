package google

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/shared/logger"
)

// GoogleOAuthService defines the interface for Google OAuth operations
type GoogleOAuthService interface {
	ValidateToken(ctx context.Context, idToken string) (*GoogleUserInfo, error)
}

// GoogleUserInfo represents the user information from Google
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Locale        string `json:"locale"`
}

// googleOAuthService implements GoogleOAuthService
type googleOAuthService struct {
	config        *config.Config
	oauth2Service *oauth2.Service
}

// NewGoogleOAuthService creates a new Google OAuth service
func NewGoogleOAuthService(cfg *config.Config) GoogleOAuthService {
	// Create OAuth2 service with context
	ctx := context.Background()
	oauth2Service, err := oauth2.NewService(ctx, option.WithoutAuthentication())
	if err != nil {
		// Log error but don't panic - service will handle errors gracefully
		logger.ErrorCtx(ctx).Err(err).Msg("failed to create OAuth2 service")
	}

	return &googleOAuthService{
		config:        cfg,
		oauth2Service: oauth2Service,
	}
}

// ValidateToken validates a Google ID token and returns user information
func (s *googleOAuthService) ValidateToken(ctx context.Context, idToken string) (*GoogleUserInfo, error) {
	if s.oauth2Service == nil {
		logger.ErrorCtx(ctx).Msg("OAuth2 service not initialized")
		return nil, fmt.Errorf("OAuth2 service not available")
	}

	// Validate input
	if strings.TrimSpace(idToken) == "" {
		logger.WarnCtx(ctx).Msg("empty ID token provided")
		return nil, fmt.Errorf("ID token is required")
	}

	// Use Google's tokeninfo endpoint through the official API
	tokenInfoCall := s.oauth2Service.Tokeninfo()
	tokenInfoCall.IdToken(idToken)
	tokenInfoCall.Context(ctx)

	tokenInfo, err := tokenInfoCall.Do()
	if err != nil {
		logger.WarnCtx(ctx).Err(err).Msg("failed to validate Google ID token")
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	// Verify the token contains required information
	if tokenInfo.UserId == "" || tokenInfo.Email == "" {
		logger.WarnCtx(ctx).
			Str("userID", tokenInfo.UserId).
			Str("email", tokenInfo.Email).
			Msg("invalid Google user info received")
		return nil, fmt.Errorf("invalid user info received from Google")
	}

	// Verify email is verified by Google
	if !tokenInfo.VerifiedEmail {
		logger.WarnCtx(ctx).
			Str("email", tokenInfo.Email).
			Msg("Google email not verified")
		return nil, fmt.Errorf("email not verified by Google")
	}

	// Verify the audience (aud) claim matches your client ID for additional security
	if s.config.GoogleOAuth.ClientID != "" && tokenInfo.Audience != "" {
		if tokenInfo.Audience != s.config.GoogleOAuth.ClientID {
			logger.WarnCtx(ctx).
				Str("expectedAudience", s.config.GoogleOAuth.ClientID).
				Str("actualAudience", tokenInfo.Audience).
				Msg("Google token audience mismatch")
			return nil, fmt.Errorf("token audience mismatch")
		}
	}

	// Convert tokenInfo to our GoogleUserInfo struct
	userInfo := &GoogleUserInfo{
		ID:            tokenInfo.UserId,
		Email:         tokenInfo.Email,
		EmailVerified: tokenInfo.VerifiedEmail,
		Name:          "", // Name is not available in tokeninfo, we'll get it from userinfo if needed
		Picture:       "", // Picture is not available in tokeninfo
		GivenName:     "", // Given name is not available in tokeninfo
		FamilyName:    "", // Family name is not available in tokeninfo
		Locale:        "", // Locale not available in tokeninfo endpoint
	}

	// Try to get additional user information from userinfo endpoint
	if err := s.enrichUserInfo(ctx, userInfo); err != nil {
		// Log the error but don't fail the authentication
		// Basic info from tokeninfo is sufficient for authentication
		logger.WarnCtx(ctx).Err(err).Msg("failed to get additional user info, using basic info")
	}

	logger.InfoCtx(ctx).
		Str("email", userInfo.Email).
		Str("name", userInfo.Name).
		Str("userID", userInfo.ID).
		Msg("Google token validated successfully")

	return userInfo, nil
}

// enrichUserInfo attempts to get additional user information from the userinfo endpoint
// This is a best-effort operation and won't fail the authentication if it doesn't work
func (s *googleOAuthService) enrichUserInfo(ctx context.Context, userInfo *GoogleUserInfo) error {
	if s.oauth2Service == nil {
		return fmt.Errorf("OAuth2 service not available")
	}

	// Note: The userinfo endpoint requires an access token, but we only have an ID token
	// For ID token validation, the tokeninfo endpoint provides sufficient information
	// In a full OAuth flow, you would use the access token here to get additional user info

	// For now, we'll skip this enrichment since we don't have an access token
	// The basic information from tokeninfo (email, user ID, verification status) is sufficient
	return nil
}
