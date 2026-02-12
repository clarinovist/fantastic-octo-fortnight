package middleware

import (
	"context"
	"net/http"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// AdminContextKey is the key used to store admin info in the request context
type AdminContextKey string

const (
	AdminInfoKey AdminContextKey = "admin_info"
)

// AdminInfo contains information about admin user
type AdminInfo struct {
	UserID   uuid.UUID `json:"userId"`
	IsAdmin  bool      `json:"isAdmin"`
	RoleName string    `json:"roleName"`
}

// AdminAuth creates a middleware that validates admin role
func AdminAuth(userRepo *repositories.UserRepository, roleRepo *repositories.RoleRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			// Get user ID from JWT claims
			userID := GetUserID(ctx)
			if userID == uuid.Nil {
				logger.ErrorCtx(ctx).Msg("[AdminAuth] User ID not found in context")
				response.Failure(w,
					base.SetStatusCode(http.StatusUnauthorized),
					base.SetMessage("unauthorized - user not authenticated"),
				)
				return
			}

			// Get user to check role
			user, err := userRepo.GetByID(ctx, userID)
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).
					Str("user_id", userID.String()).
					Msg("[AdminAuth] Error getting user")
				response.Failure(w,
					base.SetStatusCode(http.StatusUnauthorized),
					base.SetMessage("unauthorized - user not found"),
				)
				return
			}

			if len(user.Roles) == 0 {
				logger.WarnCtx(ctx).
					Str("user_id", userID.String()).
					Str("user_email", user.Email).
					Msg("[AdminAuth] User does not have any roles")
				response.Failure(w,
					base.SetStatusCode(http.StatusForbidden),
					base.SetMessage("forbidden"),
				)
				return
			}

			// For now, implement a simple admin check based on user email or other criteria
			role := user.Roles[0]
			if role.Name != model.RoleNameAdmin {
				logger.WarnCtx(ctx).
					Str("user_id", userID.String()).
					Str("user_email", user.Email).
					Msg("[AdminAuth] User does not have admin role")
				response.Failure(w,
					base.SetStatusCode(http.StatusForbidden),
					base.SetMessage("forbidden"),
				)
				return
			}

			adminInfo := AdminInfo{
				UserID:   userID,
				RoleName: role.Name,
			}

			ctx = context.WithValue(ctx, AdminInfoKey, adminInfo)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetAdminInfo extracts admin info from the request context
func GetAdminInfo(ctx context.Context) (*AdminInfo, bool) {
	adminInfo, ok := ctx.Value(AdminInfoKey).(AdminInfo)
	if !ok {
		return nil, false
	}
	return &adminInfo, true
}

// RequireAdminRole is a helper middleware that can be used in route groups
func RequireAdminRole(userRepo *repositories.UserRepository, roleRepo *repositories.RoleRepository) func(http.Handler) http.Handler {
	return AdminAuth(userRepo, roleRepo)
}
