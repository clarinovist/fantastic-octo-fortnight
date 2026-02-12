package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/jwt"
	"github.com/lesprivate/backend/transport/http/response"
)

// UserContextKey is the key used to store user claims in the request context
type UserContextKey string

const (
	UserClaimsKey UserContextKey = "user_claims"
)

// JWTAuth creates a JWT authentication middleware
func JWTAuth(jwtService *jwt.JWT) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Failure(w,
					base.SetStatusCode(http.StatusUnauthorized),
					base.SetMessage("authorization header required"),
				)
				return
			}

			// Check for Bearer token format
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
				response.Failure(w,
					base.SetStatusCode(http.StatusUnauthorized),
					base.SetMessage("invalid authorization header format"),
				)
				return
			}

			tokenString := tokenParts[1]
			if tokenString == "" {
				response.Failure(w,
					base.SetStatusCode(http.StatusUnauthorized),
					base.SetMessage("token required"),
				)
				return
			}

			// Validate the token
			claims, err := jwtService.ValidateToken(tokenString)
			if err != nil {
				response.Failure(w,
					base.SetStatusCode(http.StatusUnauthorized),
					base.SetMessage("invalid or expired token"),
				)
				return
			}

			// Add user claims to request context
			ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func JWTClaim(jwtService *jwt.JWT) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			// Check for Bearer token format
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
				next.ServeHTTP(w, r)
				return
			}

			tokenString := tokenParts[1]
			if tokenString == "" {
				next.ServeHTTP(w, r)
				return
			}

			// Validate the token
			claims, err := jwtService.ValidateToken(tokenString)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			// Add user claims to request context
			ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserClaims extracts user claims from the request context
func GetUserClaims(ctx context.Context) (*jwt.Claims, bool) {
	claims, ok := ctx.Value(UserClaimsKey).(*jwt.Claims)
	return claims, ok
}

// GetUserID extracts user ID from the request context
func GetUserID(ctx context.Context) uuid.UUID {
	claims, ok := GetUserClaims(ctx)
	if !ok {
		return uuid.Nil
	}
	return claims.UserID
}
