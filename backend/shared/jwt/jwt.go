package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Claims represents the JWT claims structure
type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Name   string    `json:"name"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

// JWT handles JWT token operations
type JWT struct {
	secretKey        string
	expiresIn        time.Duration
	refreshExpiresIn time.Duration
}

// NewJWT creates a new JWT service instance
func NewJWT(secretKey string, expiresIn, refreshExpiresIn time.Duration) *JWT {
	return &JWT{
		secretKey:        secretKey,
		expiresIn:        expiresIn,
		refreshExpiresIn: refreshExpiresIn,
	}
}

// GenerateToken generates a new JWT token for the given user
func (j *JWT) GenerateToken(userID uuid.UUID, email, name, role string) (string, int64, error) {
	now := time.Now()
	expiresAt := now.Add(j.expiresIn)

	claims := Claims{
		UserID: userID,
		Email:  email,
		Name:   name,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "les-private-backend",
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", 0, fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, expiresAt.Unix(), nil
}

// GenerateRefreshToken generates a new refresh token for the given user
func (j *JWT) GenerateRefreshToken(userID uuid.UUID, email, name, role string) (string, int64, error) {
	now := time.Now()
	expiresAt := now.Add(j.refreshExpiresIn)

	claims := Claims{
		UserID: userID,
		Email:  email,
		Name:   name,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "les-private-backend",
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", 0, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return tokenString, expiresAt.Unix(), nil
}

// GenerateTokenPair generates both access and refresh tokens for the given user
func (j *JWT) GenerateTokenPair(userID uuid.UUID, email, name, role string) (accessToken, refreshToken string, accessExpiresAt, refreshExpiresAt int64, err error) {
	// Generate access token
	accessToken, accessExpiresAt, err = j.GenerateToken(userID, email, name, role)
	if err != nil {
		return "", "", 0, 0, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token
	refreshToken, refreshExpiresAt, err = j.GenerateRefreshToken(userID, email, name, role)
	if err != nil {
		return "", "", 0, 0, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return accessToken, refreshToken, accessExpiresAt, refreshExpiresAt, nil
}

// ValidateToken validates and parses a JWT token
func (j *JWT) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token claims")
}

// RefreshToken generates a new token from an existing valid token
func (j *JWT) RefreshToken(tokenString string) (string, int64, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return "", 0, fmt.Errorf("invalid token for refresh: %w", err)
	}

	// Generate new token with same user data
	return j.GenerateToken(claims.UserID, claims.Email, claims.Name, claims.Role)
}
