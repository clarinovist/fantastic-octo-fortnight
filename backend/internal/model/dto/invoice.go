package dto

type InvoiceData struct {
	InvoiceNumber      string
	InvoiceDate        string
	CustomerEmail      string
	Status             string
	SubscriptionType   string
	SubscriptionPeriod string
	StartDate          string
	EndDate            string
	SubtotalPrice      string
	VATAmount          string
	TotalPrice         string
}
