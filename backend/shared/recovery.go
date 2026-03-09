package shared

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/lesprivate/backend/shared/logger"
)

// RecoverBackground handles panics in background goroutines
func RecoverBackground(ctx context.Context, name string) {
	if r := recover(); r != nil {
		err := fmt.Errorf("panic in %s: %v\nstack: %s", name, r, string(debug.Stack()))
		logger.ErrorCtx(ctx).Err(err).Msg("[PanicRecovery] Recovered from panic in background goroutine")
	}
}
