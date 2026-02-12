package services

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"time"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"
	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/leekchan/accounting"
	"github.com/shopspring/decimal"
	"github.com/xendit/xendit-go/v7"
	xenditcustomer "github.com/xendit/xendit-go/v7/customer"

	"github.com/lesprivate/backend/config"
	xenditext "github.com/lesprivate/backend/external/xendit"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
)

type StudentSubscriptionService struct {
	config            *config.Config
	student           *repositories.StudentRepository
	subscription      *repositories.SubscriptionRepository
	subscriptionPrice *repositories.SubscriptionPriceRepository
	payment           *repositories.PaymentRepository
	notification      *NotificationService
	xendit            *xendit.APIClient
	xenditExt         *xenditext.Client
}

func NewStudentSubscriptionService(
	config *config.Config,
	student *repositories.StudentRepository,
	subscription *repositories.SubscriptionRepository,
	subscriptionPrice *repositories.SubscriptionPriceRepository,
	payment *repositories.PaymentRepository,
	notification *NotificationService,
	xendit *xendit.APIClient,
	xenditExt *xenditext.Client,
) *StudentSubscriptionService {
	return &StudentSubscriptionService{
		config:            config,
		student:           student,
		subscription:      subscription,
		subscriptionPrice: subscriptionPrice,
		notification:      notification,
		payment:           payment,
		xendit:            xendit,
		xenditExt:         xenditExt,
	}
}

func (s *StudentSubscriptionService) GetPrices(ctx context.Context) ([]model.SubscriptionPrice, error) {
	prices, err := s.subscriptionPrice.Get(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error getting subscription prices")
		return nil, err
	}

	return prices, nil
}

func (s *StudentSubscriptionService) RegularPayment(ctx context.Context, request dto.CreateStudentSubscriptionRequest) (dto.CreateStudentSubscriptionResponse, error) {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Error getting student by user ID")
		return dto.CreateStudentSubscriptionResponse{}, err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] User not found")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrEntityNotFound, "student")
	}

	if student.IsPremium() {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Student subscription already exists")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrBadRequest, "student already premium")
	}

	payments, err := s.payment.Get(ctx, model.PaymentFilter{
		StudentID: student.ID,
		StatusIn:  []string{string(model.SubscriptionStatusPending)},
		Pagination: model.Pagination{
			PageSize: 1,
		},
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Error getting payments")
		return dto.CreateStudentSubscriptionResponse{}, err
	}

	if len(payments) > 0 {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Student has pending payment")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrStudentAlreadyHasPayment)
	}

	price, err := s.subscriptionPrice.GetByID(ctx, request.SubscriptionID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Error getting subscription prices")
		return dto.CreateStudentSubscriptionResponse{}, err
	}

	if price == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Subscription price not found")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrEntityNotFound, "subscription price")
	}

	if !student.CustomerID.Valid {
		customer := *xenditcustomer.NewCustomerRequest(student.ID.String())
		name := student.User.Name
		if name == "" {
			name = student.User.Email
		}

		customer.SetReferenceId(student.ID.String())
		customer.SetIndividualDetail(xenditcustomer.IndividualDetail{
			GivenNames: &name,
		})
		customer.SetType("INDIVIDUAL")
		customer.SetEmail(student.User.Email)
		if student.User.PhoneNumber != "" {
			customer.SetPhoneNumber(student.User.PhoneNumber)
		}

		resp, r, e := s.xendit.CustomerApi.CreateCustomer(context.Background()).
			IdempotencyKey(uuid.New().String()).
			CustomerRequest(customer).
			Execute()

		if e != nil {
			logger.ErrorCtx(ctx).Err(e).
				Interface("fullError", e.FullError()).
				Interface("resp", r).
				Msg("[CreateStudentSubscription] Error when calling CustomerApi.CreateCustomer")
			return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrInternalServer)
		}

		student.CustomerID = null.StringFrom(resp.Id)

		err = s.student.Update(ctx, student)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error updating student")
			return dto.CreateStudentSubscriptionResponse{}, err
		}
	}

	var (
		endDate   time.Time
		startDate = time.Now()
		interval  = price.Interval
		amount    = decimal.NewFromInt(int64(request.IntervalCount)).Mul(price.Price)
	)

	switch request.SubscriptionID.String() {
	case model.SubscriptionMonthlyID:
		endDate = startDate.AddDate(0, request.IntervalCount, 0)
	case model.SubscriptionYearlyID:
		endDate = startDate.AddDate(request.IntervalCount, 0, 0)
	}

	payment := &model.Payment{
		ID:            uuid.New(),
		StudentID:     student.ID,
		Interval:      interval,
		IntervalCount: request.IntervalCount,
		StartDate:     startDate,
		EndDate:       endDate,
		Amount:        amount,
		Status:        model.SubscriptionStatusPending,
		URL:           "http://test.dev/subscription",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		CreatedBy:     student.UserID,
		UpdatedBy:     student.UserID,
	}

	payment.GenerateInvoiceNumber()

	resp, err := s.xenditExt.CreatePaymentSession(ctx, xenditext.CreatePaymentSessionRequest{
		ReferenceID:      payment.InvoiceNumber,
		CustomerID:       student.CustomerID.String,
		SessionType:      "PAY",
		Currency:         xenditext.CurrencyIDR,
		Amount:           int(amount.Add(payment.VatAmount()).IntPart()),
		Mode:             "PAYMENT_LINK",
		Country:          "ID",
		Locale:           "en",
		Description:      "Les Private Subscription",
		SuccessReturnURL: s.config.Frontend.BaseURL + s.config.Frontend.SubscriptionSuccess,
		FailureReturnURL: s.config.Frontend.BaseURL + s.config.Frontend.SubscriptionFailure,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Error when calling xenditExt.CreateSubscription")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrInternalServer)
	}

	payment.URL = resp.PaymentLinkURL
	payment.ReferenceID = resp.PaymentSessionID
	err = s.payment.Create(ctx, payment)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegularPayment] Error creating subscription")
		return dto.CreateStudentSubscriptionResponse{}, err
	}

	go func() {
		err = s.notification.PaymentCreated(context.Background(), *student, *payment)
		if err != nil {
			logger.ErrorCtx(context.Background()).Err(err).Msg("[RegularPayment] Error sending payment created notification")
		}
	}()

	return dto.CreateStudentSubscriptionResponse{
		URL: resp.PaymentLinkURL,
	}, nil
}

func (s *StudentSubscriptionService) Create(ctx context.Context, request dto.CreateStudentSubscriptionRequest) (dto.CreateStudentSubscriptionResponse, error) {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error getting student by user ID")
		return dto.CreateStudentSubscriptionResponse{}, err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] User not found")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrEntityNotFound, "student")
	}

	if student.IsPremium() {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Student subscription already exists")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrBadRequest, "student already premium")
	}

	price, err := s.subscriptionPrice.GetByID(ctx, request.SubscriptionID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error getting subscription prices")
		return dto.CreateStudentSubscriptionResponse{}, err
	}

	if price == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Subscription price not found")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrEntityNotFound, "subscription price")
	}

	if !student.CustomerID.Valid {
		customer := *xenditcustomer.NewCustomerRequest(student.ID.String())
		name := student.User.Name
		if name == "" {
			name = student.User.Email
		}

		customer.SetReferenceId(student.ID.String())
		customer.SetIndividualDetail(xenditcustomer.IndividualDetail{
			GivenNames: &name,
		})
		customer.SetType("INDIVIDUAL")
		customer.SetEmail(student.User.Email)
		if student.User.PhoneNumber != "" {
			customer.SetPhoneNumber(student.User.PhoneNumber)
		}

		resp, r, e := s.xendit.CustomerApi.CreateCustomer(context.Background()).
			IdempotencyKey(uuid.New().String()).
			CustomerRequest(customer).
			Execute()

		if e != nil {
			logger.ErrorCtx(ctx).Err(e).
				Interface("fullError", e.FullError()).
				Interface("resp", r).
				Msg("[CreateStudentSubscription] Error when calling CustomerApi.CreateCustomer")
			return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrInternalServer)
		}

		student.CustomerID = null.StringFrom(resp.Id)

		err = s.student.Update(ctx, student)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error updating student")
			return dto.CreateStudentSubscriptionResponse{}, err
		}
	}

	var (
		scheduleInterval string
		endDate          time.Time
		startDate        = time.Now()
		interval         = price.Interval
		amount           = decimal.NewFromInt(int64(request.IntervalCount)).Mul(price.Price)
	)

	switch request.SubscriptionID.String() {
	case model.SubscriptionMonthlyID:
		endDate = startDate.AddDate(0, request.IntervalCount, 0)
		scheduleInterval = xenditext.ScheduleIntervalMonth
	case model.SubscriptionYearlyID:
		endDate = startDate.AddDate(request.IntervalCount, 0, 0)
		scheduleInterval = xenditext.ScheduleIntervalYear
	}

	subscription := &model.Subscription{
		ID:            uuid.New(),
		StudentID:     student.ID,
		Interval:      interval,
		IntervalCount: request.IntervalCount,
		StartDate:     startDate,
		EndDate:       endDate,
		Currency:      xenditext.CurrencyIDR,
		Amount:        amount,
		Status:        model.SubscriptionStatusPending,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		CreatedBy:     student.UserID,
		UpdatedBy:     student.UserID,
	}

	resp, err := s.xenditExt.CreateSubscription(ctx, xenditext.CreateSubscriptionRequest{
		ReferenceID:     subscription.ID.String(),
		CustomerID:      student.CustomerID.String,
		RecurringAction: xenditext.RecurringActionPayment,
		Currency:        xenditext.CurrencyIDR,
		Amount:          int(subscription.Amount.IntPart()),
		Schedule: xenditext.SubscriptionSchedule{
			ReferenceID:        request.SubscriptionID.String(),
			Interval:           scheduleInterval,
			IntervalCount:      subscription.IntervalCount,
			AnchorDate:         startDate,
			RetryInterval:      xenditext.RetryIntervalDay,
			RetryIntervalCount: 1,
			TotalRetry:         1,
			FailedAttemptNotifications: []int{
				1,
			},
		},
		ImmediateActionType:         xenditext.ImmediateActionTypeFullAmount,
		PaymentLinkForFailedAttempt: true,
		FailedCycleAction:           xenditext.FailedCycleActionResume,
		Items: []xenditext.SubscriptionItem{
			{
				Type:          xenditext.ItemTypeDigitalService,
				Name:          "Les Private Subscription",
				Quantity:      1,
				URL:           "https://les-private.com",
				NetUnitAmount: int(subscription.Amount.IntPart()),
			},
		},
		SuccessReturnURL: s.config.Frontend.BaseURL + s.config.Frontend.SubscriptionSuccess,
		FailureReturnURL: s.config.Frontend.BaseURL + s.config.Frontend.SubscriptionFailure,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error when calling xenditExt.CreateSubscription")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrInternalServer)
	}

	subscription.ReferenceID = resp.ID
	err = s.subscription.Create(ctx, subscription)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error creating subscription")
		return dto.CreateStudentSubscriptionResponse{}, err
	}

	if len(resp.Actions) == 0 {
		logger.ErrorCtx(ctx).Msg("[CreateStudentSubscription] No action found in Xendit response")
		return dto.CreateStudentSubscriptionResponse{}, shared.MakeError(ErrInternalServer)
	}

	return dto.CreateStudentSubscriptionResponse{
		URL: resp.Actions[0].URL,
	}, nil
}

func (s *StudentSubscriptionService) Get(ctx context.Context, request dto.GetStudentSubscriptionCreateRequest) ([]model.Subscription, error) {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentSubscription] Error getting student")
		return nil, err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Msg("[GetStudentSubscription] No student found")
		return nil, shared.MakeError(ErrEntityNotFound, "student")
	}

	subscriptions, err := s.subscription.Get(ctx, model.SubscriptionFilter{
		StudentID:  student.ID,
		Pagination: request.Pagination,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentSubscription] Error getting subscriptions")
		return nil, err
	}

	return subscriptions, nil
}

func (s *StudentSubscriptionService) GetPayment(ctx context.Context, request dto.GetStudentSubscriptionCreateRequest) ([]model.Payment, error) {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetPayment] Error getting student")
		return nil, err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Msg("[GetPayment] No student found")
		return nil, shared.MakeError(ErrEntityNotFound, "student")
	}

	payments, err := s.payment.Get(ctx, model.PaymentFilter{
		StudentID:  student.ID,
		Pagination: request.Pagination,
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "desc",
		},
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetPayments] Error getting subscriptions")
		return nil, err
	}

	return payments, nil
}

func (s *StudentSubscriptionService) Cancel(ctx context.Context, id uuid.UUID) error {
	subscription, err := s.subscription.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelStudentSubscription] Error getting subscription")
		return err
	}

	if subscription == nil {
		logger.ErrorCtx(ctx).Msg("[CancelStudentSubscription] No subscription found")
		return shared.MakeError(ErrEntityNotFound, "subscription")
	}

	if subscription.Status != model.SubscriptionStatusActive {
		logger.ErrorCtx(ctx).Msg("[CancelStudentSubscription] Subscription is not active")
		return shared.MakeError(ErrEntityNotFound, "subscription")
	}

	err = s.xenditExt.CancelSubscription(ctx, subscription.ReferenceID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelStudentSubscription] Error canceling subscription")
		return err
	}

	subscription.Status = model.SubscriptionStatusCanceled
	err = s.subscription.Update(ctx, subscription)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelStudentSubscription] Error updating subscription")
		return err
	}

	return nil
}

func (s *StudentSubscriptionService) CancelPayment(ctx context.Context, id uuid.UUID) error {
	payment, err := s.payment.GetByID(ctx, id.String())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelPayment] Error getting payment")
		return err
	}

	if payment == nil {
		logger.ErrorCtx(ctx).Msg("[CancelPayment] No payment found")
		return shared.MakeError(ErrEntityNotFound, "payment")
	}

	if payment.Status != model.SubscriptionStatusPending {
		logger.ErrorCtx(ctx).Msg("[CancelPayment] Subscription is not pending")
		return shared.MakeError(ErrEntityNotFound, "payment")
	}

	if payment.ReferenceID == "" {
		logger.ErrorCtx(ctx).Msg("[CancelPayment] can not cancel payment")
		return shared.MakeError(ErrBadRequest, "can not cancel payment")
	}

	err = s.xenditExt.CancelPayment(ctx, payment.ReferenceID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelPayment] Error canceling payment")
		return err
	}

	payment.Status = model.SubscriptionStatusCanceled
	err = s.payment.Update(ctx, payment)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelPayment] Error updating subscription")
		return err
	}

	return nil
}

func (s *StudentSubscriptionService) CreateInvoice(ctx context.Context, id uuid.UUID) ([]byte, string, error) {
	payment, err := s.payment.GetByID(ctx, id.String())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoice] Error getting subscription")
		return nil, "", err
	}

	if payment == nil {
		logger.ErrorCtx(ctx).Msg("[CreateInvoice] No subscription found")
		return nil, "", shared.MakeError(ErrEntityNotFound, "subscription")
	}

	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoice] Error getting student")
		return nil, "", err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Msg("[CreateInvoice] No student found")
		return nil, "", shared.MakeError(ErrEntityNotFound, "student")
	}

	ac := accounting.Accounting{
		Symbol:    "Rp",
		Precision: 2,
		Thousand:  ".",
		Decimal:   ",",
	}
	var period string
	switch payment.Interval {
	case model.SubscriptionIntervalYearly:
		period = "Year"
	case model.SubscriptionIntervalMonthly:
		period = "Month"
	}
	subscriptionPeriod := fmt.Sprintf("%d %s", payment.IntervalCount, period)
	invoice := dto.InvoiceData{
		InvoiceNumber:      payment.InvoiceNumber,
		InvoiceDate:        time.Now().Format("02/01/2006"),
		CustomerEmail:      payment.Student.User.Email,
		Status:             payment.Status.InvoiceLabel(),
		SubscriptionType:   "Les Private Premium Subscription",
		SubscriptionPeriod: subscriptionPeriod,
		StartDate:          payment.StartDate.Format("02/01/2006"),
		EndDate:            payment.EndDate.Format("02/01/2006"),
		SubtotalPrice:      ac.FormatMoney(payment.Amount),
		VATAmount:          ac.FormatMoney(payment.VatAmount()),
		TotalPrice:         ac.FormatMoney(payment.Amount.Add(payment.VatAmount())),
	}

	// Parse the template file
	tmpl, err := template.ParseFiles("./templates/pdf/invoice/index.html")
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoice] failed to parse template")
		return nil, "", err
	}

	// Execute template with data
	var buf bytes.Buffer
	err = tmpl.Execute(&buf, invoice)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoice] failed to execute template")
		return nil, "", err
	}

	// Create new PDF generator
	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoice] failed to create pdf generator")
		return nil, "", err
	}

	page := wkhtmltopdf.NewPageReader(bytes.NewReader(buf.Bytes()))
	pdfg.AddPage(page)

	// Set PDF options
	pdfg.PageSize.Set(wkhtmltopdf.PageSizeA4)
	pdfg.MarginTop.Set(10)
	pdfg.MarginBottom.Set(10)
	pdfg.MarginLeft.Set(10)
	pdfg.MarginRight.Set(10)
	pdfg.Dpi.Set(300)
	pdfg.Orientation.Set(wkhtmltopdf.OrientationPortrait)
	pdfg.Grayscale.Set(false)

	// Create PDF
	err = pdfg.Create()
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoice] failed to create pdf")
		return nil, "", err
	}

	return pdfg.Bytes(), fmt.Sprintf("%s.pdf", payment.InvoiceNumber), nil
}
