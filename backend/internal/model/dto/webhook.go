package dto

import (
	"time"
)

const (
	WebhookXenditEventTypeRecurringCycleSucceeded = "recurring.cycle.succeeded"
	WebhookXenditEventTypeRecurringCycleFailed    = "recurring.cycle.failed"
	WebhookXenditEventTypePaymentSessionCompleted = "payment_session.completed"
	WebhookXenditEventTypePaymentSessionExpired   = "payment_session.expired"
)

type WebhookXenditRecurringCycle struct {
	ID             string      `json:"id"`
	Type           string      `json:"type"`
	Amount         int         `json:"amount"`
	Status         string      `json:"status"`
	Created        time.Time   `json:"created"`
	PlanID         string      `json:"plan_id"`
	Updated        time.Time   `json:"updated"`
	Currency       string      `json:"currency"`
	Metadata       interface{} `json:"metadata"`
	CustomerID     string      `json:"customer_id"`
	CycleNumber    int         `json:"cycle_number"`
	ReferenceID    string      `json:"reference_id"`
	AttemptCount   int         `json:"attempt_count"`
	AttemptDetails []struct {
		Type               string      `json:"type"`
		Status             string      `json:"status"`
		Created            time.Time   `json:"created"`
		ActionID           string      `json:"action_id"`
		FailureCode        interface{} `json:"failure_code"`
		PaymentLink        interface{} `json:"payment_link"`
		ActionNumber       int         `json:"action_number"`
		AttemptNumber      int         `json:"attempt_number"`
		NextRetryTimestamp interface{} `json:"next_retry_timestamp"`
	} `json:"attempt_details"`
	RecurringAction    string    `json:"recurring_action"`
	ScheduledTimestamp time.Time `json:"scheduled_timestamp"`
	ForcedAttemptCount int       `json:"forced_attempt_count"`
}

type WebhookXenditPaymentSessionCompleted struct {
	Mode             string    `json:"mode"`
	Amount           int       `json:"amount"`
	Locale           string    `json:"locale"`
	Status           string    `json:"status"`
	Country          string    `json:"country"`
	Created          time.Time `json:"created"`
	Updated          time.Time `json:"updated"`
	Currency         string    `json:"currency"`
	ExpiresAt        time.Time `json:"expires_at"`
	PaymentID        string    `json:"payment_id"`
	BusinessID       string    `json:"business_id"`
	CustomerID       string    `json:"customer_id"`
	Description      string    `json:"description"`
	ReferenceID      string    `json:"reference_id"`
	SessionType      string    `json:"session_type"`
	CaptureMethod    string    `json:"capture_method"`
	PaymentLinkURL   string    `json:"payment_link_url"`
	PaymentRequestID string    `json:"payment_request_id"`
	PaymentSessionID string    `json:"payment_session_id"`
	SuccessReturnURL string    `json:"success_return_url"`
}

type WebhookXenditRequest struct {
	Created    time.Time `json:"created"`
	BusinessID string    `json:"business_id"`
	Event      string    `json:"event"`
	Data       any       `json:"data"`
	APIVersion string    `json:"api_version"`
	WebhookKey string    `json:"-"`
}
