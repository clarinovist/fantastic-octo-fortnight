package xendit

import "time"

const (
	CurrencyIDR = "IDR"

	RecurringActionPayment = "PAYMENT"

	ScheduleIntervalMonth = "MONTH"
	ScheduleIntervalYear  = "YEAR"

	RetryIntervalDay = "DAY"

	ImmediateActionTypeFullAmount = "FULL_AMOUNT"

	ItemTypeDigitalService = "DIGITAL_SERVICE"

	FailedCycleActionResume = "RESUME"
)

type SubscriptionSchedule struct {
	ReferenceID                string    `json:"reference_id"`
	Interval                   string    `json:"interval"`
	IntervalCount              int       `json:"interval_count"`
	AnchorDate                 time.Time `json:"anchor_date"`
	RetryInterval              string    `json:"retry_interval"`
	RetryIntervalCount         int       `json:"retry_interval_count"`
	TotalRetry                 int       `json:"total_retry"`
	FailedAttemptNotifications []int     `json:"failed_attempt_notifications"`
}

type SubscriptionItem struct {
	Type          string `json:"type"`
	Name          string `json:"name"`
	NetUnitAmount int    `json:"net_unit_amount"`
	Quantity      int    `json:"quantity"`
	URL           string `json:"url"`
	Category      string `json:"category"`
	Subcategory   string `json:"subcategory"`
	Description   string `json:"description"`
}

type CreateSubscriptionRequest struct {
	ReferenceID                 string               `json:"reference_id"`
	CustomerID                  string               `json:"customer_id"`
	RecurringAction             string               `json:"recurring_action"`
	Currency                    string               `json:"currency"`
	Amount                      int                  `json:"amount"`
	Schedule                    SubscriptionSchedule `json:"schedule"`
	ImmediateActionType         string               `json:"immediate_action_type"`
	PaymentLinkForFailedAttempt bool                 `json:"payment_link_for_failed_attempt"`
	FailedCycleAction           string               `json:"failed_cycle_action"`
	Items                       []SubscriptionItem   `json:"items"`
	SuccessReturnURL            string               `json:"success_return_url"`
	FailureReturnURL            string               `json:"failure_return_url"`
}

type CreateSubscriptionResponse struct {
	ID      string `json:"id"`
	Actions []struct {
		URL     string `json:"url"`
		Action  string `json:"action"`
		Method  string `json:"method"`
		URLType string `json:"url_type"`
	} `json:"actions"`
}

type CreatePaymentSessionRequest struct {
	ReferenceID      string `json:"reference_id"`
	CustomerID       string `json:"customer_id"`
	SessionType      string `json:"session_type"`
	Currency         string `json:"currency"`
	Amount           int    `json:"amount"`
	Mode             string `json:"mode"`
	Country          string `json:"country"`
	Locale           string `json:"locale"`
	Description      string `json:"description"`
	SuccessReturnURL string `json:"success_return_url"`
	FailureReturnURL string `json:"failure_return_url"`
}

type CreatePaymentSessionResponse struct {
	PaymentLinkURL   string `json:"payment_link_url"`
	PaymentSessionID string `json:"payment_session_id"`
}
