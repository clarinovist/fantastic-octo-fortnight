package model

import (
	"fmt"
)

const (
	LocationKey               = "location:%s"
	LocationLatLongKey        = "location:latlong:%s:%s"
	EmailVerificationKey      = "email-verification:%s"
	PasswordResetKey          = "password-reset:%s"
	ReminderExpiredBookingKey = "reminder-expired-booking:%s"
	ReminderCourseBookingKey  = "reminder-course-booking:%s"
)

func BuildCacheKey(key string, args ...any) string {
	return fmt.Sprintf(key, args...)
}
