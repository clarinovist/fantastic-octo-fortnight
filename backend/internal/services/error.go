package services

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/lesprivate/backend/shared"
)

type Err struct {
	err  error
	args []any
}

const (
	ErrCodeMaxBookingPerDay = 4001 + iota
	ErrCodeMaxBookingPerCategory
	ErrCodeStudentAlreadyHasAnotherSchedule
	ErrCodeMaxBookingFreeFirstCourse
	ErrCodeBookingAlreadExists
	ErrCodeStudentAlreadyHasPayment
)

const (
	ErrInternalServer                   = "internal server error"
	ErrUnauthorized                     = "unauthorized"
	ErrEntityNotFound                   = "not found"
	ErrBadRequest                       = "bad request"
	ErrMaxBookingPerDay                 = "max booking per day"
	ErrMaxBookingPerCategory            = "max booking per category"
	ErrStudentAlreadyHasAnotherSchedule = "student already has another schedule"
	ErrMaxBookingFreeFirstCourse        = "Oops! hanya bisa booking<br><strong>“kursus pertama gratis”</strong> sekali per hari"
	ErrBookingAlreadyExists             = "booking already exists"
	ErrStudentAlreadyHasPayment         = "Payment sudah terbuat di halaman Kelola Langganan"
)

var (
	errorMapMessage = map[string]string{
		ErrInternalServer:                   "Something went wrong",
		ErrUnauthorized:                     "Unauthorized",
		ErrEntityNotFound:                   "'%s' not found",
		ErrBadRequest:                       "Bad request: %s",
		ErrMaxBookingPerDay:                 "You have reached the maximum number of bookings per day",
		ErrMaxBookingPerCategory:            "You have reached the maximum number of bookings per category",
		ErrStudentAlreadyHasAnotherSchedule: "You already have another schedule in the same day",
		ErrMaxBookingFreeFirstCourse:        "Booking “kursus pertama gratis” dibatasi 1 kali/mata pelajaran per hari. Apabila ingin booking dengan label yang sama, pilih mata pelajaran lain.",
		ErrBookingAlreadyExists:             "Booking already exists",
		ErrStudentAlreadyHasPayment:         "Payment sudah terbuat di halaman Kelola Langganan",
	}

	errorMapHttpCode = map[string]int{
		ErrInternalServer:                   http.StatusInternalServerError,
		ErrUnauthorized:                     http.StatusUnauthorized,
		ErrEntityNotFound:                   http.StatusNotFound,
		ErrBadRequest:                       http.StatusBadRequest,
		ErrMaxBookingPerDay:                 http.StatusBadRequest,
		ErrMaxBookingPerCategory:            http.StatusBadRequest,
		ErrStudentAlreadyHasAnotherSchedule: http.StatusBadRequest,
		ErrMaxBookingFreeFirstCourse:        http.StatusBadRequest,
		ErrBookingAlreadyExists:             http.StatusBadRequest,
		ErrStudentAlreadyHasPayment:         http.StatusBadRequest,
	}

	errorMapCode = map[string]int{
		ErrInternalServer:                   http.StatusInternalServerError,
		ErrMaxBookingPerDay:                 ErrCodeMaxBookingPerDay,
		ErrMaxBookingPerCategory:            ErrCodeMaxBookingPerCategory,
		ErrStudentAlreadyHasAnotherSchedule: ErrCodeStudentAlreadyHasAnotherSchedule,
		ErrMaxBookingFreeFirstCourse:        ErrCodeMaxBookingFreeFirstCourse,
		ErrBookingAlreadyExists:             ErrCodeBookingAlreadExists,
		ErrStudentAlreadyHasPayment:         ErrCodeStudentAlreadyHasPayment,
	}
)

func Error(err error) *Err {
	msg, arguments := shared.GenerateError(err)
	return &Err{
		err:  errors.New(msg),
		args: arguments,
	}
}

func (p *Err) GetError() error {
	return p.err
}

func (p *Err) GetHTTPCode() int {
	val, ok := errorMapHttpCode[p.err.Error()]
	if !ok {
		return http.StatusInternalServerError
	}

	return val
}

func (p *Err) GetCode() int {
	val, ok := errorMapCode[p.err.Error()]
	if !ok {
		return 0
	}

	return val
}

func (p *Err) GetMessage() string {
	val, ok := errorMapMessage[p.err.Error()]
	if !ok {
		return errorMapMessage[ErrInternalServer]
	}

	return fmt.Sprintf(val, p.args...)
}

// Error implements the error interface
func (p *Err) Error() string {
	return p.GetMessage()
}
