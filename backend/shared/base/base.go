package base

import (
	"net/http"
)

type Error interface {
	GetError() error
	GetHTTPCode() int
	GetMessage() string
	GetCode() int
}

type Base struct {
	StatusCode int         `json:"statusCode"`
	Success    bool        `json:"success"`
	Message    string      `json:"message"`
	Error      string      `json:"error,omitempty"`
	Code       int         `json:"code,omitempty"`
	Data       interface{} `json:"data,omitempty"`
	Metadata   interface{} `json:"metadata,omitempty"`
}

func Failure() *Base {
	return &Base{
		Success:    false,
		StatusCode: http.StatusBadRequest,
		Message:    http.StatusText(http.StatusBadRequest),
		Error:      http.StatusText(http.StatusBadRequest),
	}
}

func Success() *Base {
	return &Base{
		Success:    true,
		Message:    http.StatusText(http.StatusOK),
		StatusCode: http.StatusOK,
	}
}

func SetStatusCode(statusCode int) func(b *Base) {
	return func(b *Base) {
		b.StatusCode = statusCode
	}
}

func SetMessage(message string) func(b *Base) {
	return func(b *Base) {
		b.Message = message
	}
}

func SetData(data interface{}) func(b *Base) {
	return func(b *Base) {
		b.Data = data
	}
}

func SetError(errMsg string) func(b *Base) {
	return func(b *Base) {
		b.Error = errMsg
	}
}

func SetMetadata(metadata interface{}) func(b *Base) {
	return func(b *Base) {
		b.Metadata = metadata
	}
}

func CustomError(e Error) func(b *Base) {
	return func(b *Base) {
		b.StatusCode = e.GetHTTPCode()
		b.Message = e.GetMessage()
		b.Error = e.GetError().Error()
		b.Code = e.GetCode()
	}
}
