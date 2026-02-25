package email

import (
	"bytes"
	"context"
	"fmt"
	"strings"
	"text/template"
	"time"

	"github.com/resend/resend-go/v2"

	"github.com/goodsign/monday"
	"github.com/leekchan/accounting"
	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

// EmailService interface defines email sending capabilities
type EmailService interface {
	SendVerificationEmail(ctx context.Context, to, verificationLink string) error
	SendPasswordResetEmail(ctx context.Context, to, resetLink string) error
	SendBookingCourseStudentEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error
	SendBookingCourseTutorEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error
	SendUpdateStatusBookingTutorEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error
	SendUpdateStatusBookingStudentEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error
	SendReminderExpiredBookingTutorEmail(ctx context.Context, booking model.Booking, location model.Location) error
	SendReminderCourseBookingStudentEmail(ctx context.Context, booking model.Booking, location model.Location) error
	SendReviewBookingTutor(ctx context.Context, booking model.Booking, location model.Location) error
	SendReviewBookingStudent(ctx context.Context, booking model.Booking, location model.Location) error
	SendSubmitReviewTutor(ctx context.Context, review model.TutorReview) error
	SendPaymentCreatedEmail(ctx context.Context, student model.Student, payment model.Payment) error
	SendPaymentCompletedEmail(ctx context.Context, student model.Student, payment model.Payment) error
	SendEmail(ctx context.Context, to, subject, body string) error
}

// Service implements EmailService interface
type Service struct {
	config *config.Config
	resend *resend.Client
}

// NewEmailService creates a new email service instance
func NewEmailService(cfg *config.Config) EmailService {
	client := resend.NewClient(cfg.Resend.ApiKey)

	return &Service{
		config: cfg,
		resend: client,
	}
}

// SendVerificationEmail sends a verification email to newly registered users
func (s *Service) SendVerificationEmail(ctx context.Context, to, verificationLink string) error {
	subject := "Verify Your Email - Les Private"
	body := s.generateVerificationEmailBody(verificationLink)

	return s.SendEmail(ctx, to, subject, body)
}

// SendPasswordResetEmail sends a password reset email to users who forgot their password
func (s *Service) SendPasswordResetEmail(ctx context.Context, to, resetLink string) error {
	subject := "Reset Your Password - Les Private"
	body := s.generatePasswordResetEmailBody(resetLink)

	return s.SendEmail(ctx, to, subject, body)
}

func (s *Service) SendBookingCourseStudentEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error {
	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID)

	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notes := "-"
	if booking.NotesTutor.Valid {
		notes = booking.NotesTutor.String
	}

	subject := "Permintaan Booking Terkirim 🚀"
	body := fmt.Sprintf(templateBookingCourseStudent,
		student.Name,
		tutor.Name,
		booking.Course.Title,
		strings.ToUpper(string(booking.ClassType)),
		monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		t.Format("15.04"),
		booking.Timezone,
		location.FullName,
		notes,
		link,
		link,
	)

	return s.SendEmail(ctx, student.Email, subject, body)
}

func (s *Service) SendBookingCourseTutorEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error {
	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID)

	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notes := "-"
	if booking.NotesTutor.Valid {
		notes = booking.NotesTutor.String
	}

	subject := "Permintaan Booking Baru dari " + student.Name
	body := fmt.Sprintf(templateBookingCourseTutor,
		student.Name,
		tutor.Name,
		student.Name,
		booking.Course.Title,
		strings.ToUpper(string(booking.ClassType)),
		monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		t.Format("15.04"),
		booking.Timezone,
		location.FullName,
		notes,
		link,
		link,
	)

	return s.SendEmail(ctx, tutor.Email, subject, body)
}

func (s *Service) SendPaymentCreatedEmail(ctx context.Context, student model.Student, payment model.Payment) error {
	tmpl, err := template.ParseFiles("./templates/email/payment/created.html")
	if err != nil {
		return err
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

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, map[string]interface{}{
		"student_name":   student.User.Name,
		"package_name":   payment.Name(),
		"invoice_number": payment.InvoiceNumber,
		"created_date":   monday.Format(payment.CreatedAt, "Monday, 02 Jan 2006", monday.LocaleIdID),
		"price":          ac.FormatMoney(payment.Amount),
		"period":         fmt.Sprintf("%d %s", payment.IntervalCount, period),
		"payment_url":    payment.URL,
	})
	if err != nil {
		return err
	}

	return s.SendEmail(ctx, student.User.Email, "Menunggu Pembayaran User Premium", buf.String())
}

func (s *Service) SendPaymentCompletedEmail(ctx context.Context, student model.Student, payment model.Payment) error {
	tmpl, err := template.ParseFiles("./templates/email/payment/completed.html")
	if err != nil {
		return err
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

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, map[string]interface{}{
		"student_name":   student.User.Name,
		"package_name":   payment.Name(),
		"invoice_number": payment.InvoiceNumber,
		"created_date":   monday.Format(payment.CreatedAt, "Monday, 02 Jan 2006", monday.LocaleIdID),
		"price":          ac.FormatMoney(payment.Amount),
		"period":         fmt.Sprintf("%d %s", payment.IntervalCount, period),
		"account_url":    s.config.Frontend.BaseURL + s.config.Frontend.Account,
	})
	if err != nil {
		return err
	}

	return s.SendEmail(ctx, student.User.Email, "Pembayaran Berhasil! 🎉", buf.String())
}

func (s *Service) SendReminderExpiredBookingTutorEmail(ctx context.Context, booking model.Booking, location model.Location) error {
	tmpl, err := template.ParseFiles("./templates/email/booking/reminder-tutor-expired.html")
	if err != nil {
		return err
	}

	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID)
	reminderDuration := booking.ReminderBeforeExpiredInHour()

	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notes := "-"
	if booking.NotesTutor.Valid {
		notes = booking.NotesTutor.String
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, map[string]interface{}{
		"expire_in":    reminderDuration,
		"course_title": booking.Course.Title,
		"student_name": booking.Student.User.Name,
		"class_type":   strings.ToUpper(string(booking.ClassType)),
		"booking_date": monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		"booking_time": t.Format("15.04"),
		"timezone":     booking.Timezone,
		"location":     location.FullName,
		"notes":        notes,
		"booking_link": link,
	})
	if err != nil {
		return err
	}

	subject := fmt.Sprintf("Permintaan Booking Akan Expire dalam %d Jam dari %s", reminderDuration, booking.Student.User.Name)
	return s.SendEmail(ctx, booking.Tutor.User.Email, subject, buf.String())
}

func (s *Service) SendReminderCourseBookingStudentEmail(ctx context.Context, booking model.Booking, location model.Location) error {
	tmpl, err := template.ParseFiles("./templates/email/booking/reminder-student-after-accepted.html")
	if err != nil {
		return err
	}

	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID)

	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notes := "-"
	if booking.NotesStudent.Valid {
		notes = booking.NotesStudent.String
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, map[string]interface{}{
		"course_title": booking.Course.Title,
		"student_name": booking.Student.User.Name,
		"class_type":   strings.ToUpper(string(booking.ClassType)),
		"booking_date": monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		"booking_time": t.Format("15.04"),
		"timezone":     booking.Timezone,
		"location":     location.FullName,
		"notes":        notes,
		"booking_link": link,
	})
	if err != nil {
		return err
	}

	subject := fmt.Sprintf("Reminder Les %s", booking.Course.Title)
	return s.SendEmail(ctx, booking.Student.User.Email, subject, buf.String())
}

func (s *Service) SendReviewBookingTutor(ctx context.Context, booking model.Booking, location model.Location) error {
	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID)

	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notes := "-"
	if booking.NotesTutor.Valid {
		notes = booking.NotesTutor.String
	}

	subject := "Beri Ulasan untuk Siswa"
	body := fmt.Sprintf(templateSendReviewBookingTutor,
		booking.Tutor.User.Name,
		booking.Student.User.Name,
		booking.Course.Title,
		strings.ToUpper(string(booking.ClassType)),
		monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		t.Format("15.04"),
		booking.Timezone,
		location.FullName,
		notes,
		link,
		link,
	)

	return s.SendEmail(ctx, booking.Tutor.User.Email, subject, body)
}

func (s *Service) SendSubmitReviewTutor(ctx context.Context, review model.TutorReview) error {
	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, review.Booking.ID)

	subject := "Kamu Mendapatkan Ulasan!"
	body := fmt.Sprintf(templateSubmitReviewTutor,
		review.Booking.Tutor.User.Name,
		review.Booking.Student.User.Name,
		review.Booking.Course.Title,
		review.Booking.Course.Title,
		strings.Repeat("⭐️ ", int(review.Rate.Int64)),
		review.Review.String,
		link,
		link,
	)

	return s.SendEmail(ctx, review.Tutor.User.Email, subject, body)
}

func (s *Service) SendReviewBookingStudent(ctx context.Context, booking model.Booking, location model.Location) error {
	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID)

	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notes := "-"
	if booking.NotesStudent.Valid {
		notes = booking.NotesStudent.String
	}

	subject := "Bagaimana Les Anda?"
	body := fmt.Sprintf(templateSendReviewBookingStudent,
		booking.Student.User.Name,
		booking.Tutor.User.Name,
		booking.Course.Title,
		strings.ToUpper(string(booking.ClassType)),
		monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		t.Format("15.04"),
		booking.Timezone,
		location.FullName,
		notes,
		link,
		link,
	)

	return s.SendEmail(ctx, booking.Student.User.Email, subject, body)
}

func (s *Service) SendUpdateStatusBookingTutorEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error {
	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notes := "-"
	if booking.NotesTutor.Valid {
		notes = booking.NotesTutor.String
	}

	var badge string
	if booking.Status == model.BookingStatusAccepted {
		badge = `<div class="detail-value" style="text-align: center;"><span class="status-badge status-accepted">DITERIMA</span></div>`
	}

	if booking.Status == model.BookingStatusDeclined {
		badge = `<div class="detail-value" style="text-align: center;"><span class="status-badge status-rejected">DITOLAK</span></div>`
	}

	subject := "Status Booking Les Private"
	body := fmt.Sprintf(templateUpdateStatusBookingTutor,
		booking.Course.Title,
		tutor.Name,
		student.Name,
		booking.Course.Title,
		strings.ToUpper(string(booking.ClassType)),
		monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		t.Format("15.04"),
		booking.Timezone,
		location.FullName,
		notes,
		badge,
		booking.Code,
	)

	return s.SendEmail(ctx, tutor.Email, subject, body)
}

func (s *Service) SendUpdateStatusBookingStudentEmail(ctx context.Context, student model.User, tutor model.User, booking model.Booking, location model.Location) error {
	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID)

	t, err := time.Parse(time.TimeOnly, booking.BookingTime)
	if err != nil {
		return err
	}

	notesForTutor := "-"
	if booking.NotesTutor.Valid {
		notesForTutor = booking.NotesTutor.String
	}

	notesForStudent := "-"
	if booking.NotesStudent.Valid {
		notesForStudent = booking.NotesStudent.String
	}

	var (
		badge string
		title string
		info  string
	)
	if booking.Status == model.BookingStatusAccepted {
		badge = `<div class="detail-value" style="text-align: center;"><span class="status-badge status-accepted">DITERIMA</span></div>`
		title = fmt.Sprintf(`
             <div class="success-box">
				<h3>✅ Booking Dikonfirmasi</h3>
				<p style="color: #065f46;">Kabar gembira! <strong>%s</strong> telah menerima permintaan booking Anda. Les privat Anda sudah terkonfirmasi!</p>
            </div>
		`, tutor.Name)
		info = fmt.Sprintf(`
			<div class="info-box">
				<strong>💡 Langkah Selanjutnya:</strong><br>
				1. Simpan jadwal les Anda<br>
				2. Siapkan materi atau pertanyaan yang ingin dipelajari<br>
				3. Pastikan perangkat dan koneksi internet stabil (untuk online)<br>
				4. Hubungi tutor via Platform atau social media yang tercantum pada dashboard.
			</div>
			<div style="text-align: center;">
				<div class="button-group">
					<a href="%s" class="cta-button">
						BUKA DETAIL BOOKING
					</a>
				</div>
			</div>`, link)
	}

	if booking.Status == model.BookingStatusDeclined {
		linkReBooking := fmt.Sprintf("%s%s%s",
			s.config.Frontend.BaseURL,
			s.config.Frontend.DetailCourse,
			booking.CourseID,
		)
		linkAnotherCourse := fmt.Sprintf("%s%s?courseCategoryId=%s&courseCategoryName=%s",
			s.config.Frontend.BaseURL,
			s.config.Frontend.ListCourse,
			booking.Course.CourseCategory.ID,
			booking.Course.CourseCategory.Name,
		)
		badge = `<div class="detail-value" style="text-align: center;"><span class="status-badge status-rejected">DITOLAK</span></div>`
		title = fmt.Sprintf(`
            <div class="warning-box">
				<h3>ℹ️ Booking Tidak Dapat Diproses</h3>
				<p style="color: #92400e;">Mohon maaf, <strong>%s</strong> tidak dapat menerima permintaan booking Anda saat ini.</p>
			</div>`, tutor.Name)
		info = fmt.Sprintf(`
			<div class="info-box">
				<strong>💡 Saran untuk Anda:</strong><br>
				• Coba cari tutor lain yang tersedia di waktu yang sama<br>
				• Pilih waktu alternatif dan coba booking ulang dengan tutor yang sama<br>
				• Hubungi kami jika Anda butuh bantuan mencari tutor yang tepat
			</div>
			<div style="text-align: center;">
				<div class="button-group">
					<a href="%s" class="cta-button">
						🔍 CARI TUTOR LAIN
					</a>
					<a href="%s" class="cta-button secondary">
						🔄 BOOKING ULANG
					</a>
				</div>
			</div>`, linkAnotherCourse, linkReBooking)
	}

	subject := "Status Booking Les Private"
	body := fmt.Sprintf(templateUpdateStatusBookingStudent,
		booking.Course.Title,
		student.Name,
		title,
		booking.Course.Title,
		strings.ToUpper(string(booking.ClassType)),
		monday.Format(booking.BookingDate, "Monday, 02 Jan 2006", monday.LocaleIdID),
		t.Format("15.04"),
		booking.Timezone,
		location.FullName,
		notesForTutor,
		badge,
		notesForStudent,
		info,
		booking.Code,
	)

	return s.SendEmail(ctx, student.Email, subject, body)
}

// SendEmail sends an email with the specified parameters
func (s *Service) SendEmail(ctx context.Context, to, subject, body string) error {
	from := s.config.Resend.From
	if from == "" {
		from = "onboarding@resend.dev"
	}

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{to},
		Subject: subject,
		Html:    body,
	}

	_, err := s.resend.Emails.SendWithContext(ctx, params)
	if err != nil {
		logger.ErrorCtx(ctx).
			Err(err).
			Str("to", to).
			Str("subject", subject).
			Msg("failed to send email via resend")
		return fmt.Errorf("failed to send email: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("to", to).
		Str("subject", subject).
		Msg("email sent successfully via resend")

	return nil
}

// generateVerificationEmailBody generates the HTML body for verification email
func (s *Service) generateVerificationEmailBody(verificationLink string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Lesprivate</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .logo-placeholder {
            background: rgba(255,255,255,0.2);
            border: 2px dashed rgba(255,255,255,0.5);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            color: white;
            font-size: 14px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .security-note {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <!-- English Version -->
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1>Welcome to Lesprivate!</h1>
        </div>

        <div class="content">
            <div class="welcome-text">
                🎉 Thank you for signing up to our platform!
            </div>

            <div class="message">
                We're excited to have you join the Lesprivate community. To complete your registration and start accessing all our exclusive features, please verify your email address by clicking the button below.
            </div>

            <div style="text-align: center;">
                <a href="%s" class="cta-button">
                    ✨ Activate Your Account
                </a>
            </div>

            <div class="security-note">
                <strong>🔒 Security Note:</strong> This link will expire in 24 hours for your security. If you didn't create an account with us, please ignore this email.
            </div>

            <div class="message">
                If the button above doesn't work, you can also copy and paste this link into your browser:
                <br><br>
                <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">%s</code>
            </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`, verificationLink, verificationLink)
}

// generatePasswordResetEmailBody generates the HTML body for password reset email
func (s *Service) generatePasswordResetEmailBody(resetLink string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Lesprivate</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .security-note {
            background: #fff3cd;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #856404;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1>Reset Your Password</h1>
        </div>

        <div class="content">
            <div class="welcome-text">
                🔐 Password Reset Request
            </div>

            <div class="message">
                We received a request to reset your password for your Lesprivate account. If you made this request, click the button below to create a new password.
            </div>

            <div style="text-align: center;">
                <a href="%s" class="cta-button">
                    🔑 Reset Password
                </a>
            </div>

            <div class="security-note">
                <strong>⚠️ Security Alert:</strong> This link will expire in 1 hour for your security. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>

            <div class="message">
                If the button above doesn't work, you can also copy and paste this link into your browser:
                <br><br>
                <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">%s</code>
            </div>

            <div class="message" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <strong>Why did I receive this email?</strong><br>
                This email was sent because someone (hopefully you) requested a password reset for your account. If you didn't make this request, you can safely ignore this email.
            </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`, resetLink, resetLink)
}

var (
	templateBookingCourseStudent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Permintaan Booking Terkirim 🚀</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-top: 10px;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* BOOKING DETAIL BOX - CARD STYLE */
        .booking-detail-box {
            background: white;
            border-radius: 12px;
            padding: 0;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .booking-detail-box h3 {
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            font-size: 18px;
            padding: 15px 20px;
            margin: 0;
            font-weight: bold;
        }

        .booking-content {
            padding: 25px;
        }

        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .section-type {
            font-size: 14px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 25px;
        }

        .section-content {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
            line-height: 1.5;
        }

        .section-content.large {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .time-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 8px 18px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        .type-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 14px 26px;
            border-radius: 22px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .notes-box {
            background: #f7fafc;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #4a5568;
            line-height: 1.6;
        }

        .notes-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .cta-button.secondary {
            background: linear-gradient(45deg, #10b981, #059669);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .cta-button.danger {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .success-box h3 {
            color: #10b981;
            margin-bottom: 10px;
        }

        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .warning-box h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }

        .status-accepted {
            background: #d1fae5;
            color: #065f46;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        .template-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .template-selector select {
            padding: 10px;
            border: 2px solid #8b5cf6;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        }

        .email-template {
            display: none;
        }

        .email-template.active {
            display: block;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
                width: 100%%;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                min-width: 100%%;
                margin-bottom: 5px;
            }

            .button-group {
                flex-direction: column;
            }

            .template-selector {
                position: static;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1><h1>Permintaan Booking Terkirim 🚀</h1></h1>
        </div>

        <div class="content">
            <div class="welcome-text">
                Halo %s,
            </div>

            <div class="message">
                Terima kasih telah melakukan permintaan booking les privat! Permintaan Anda telah berhasil dikirim kepada %s.
            </div>

            <!-- BOOKING DETAIL BOX -->
                <div class="booking-detail-box">
                    <h3>%s</h3>

                    <div class="booking-content">
                        <div class="detail-section">
                            <div class="section-type"><span class="type-badge">%s</span></div>
                            <div class="section-content large">%s</div>
                            <div class="section-content large">%s %s<span class="time-badge">1 Jam</span></div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Permintaan lokasi</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Catatan Booking</div>
                            <div class="section-content">%s</div>
                        </div>
                    </div>
                </div>

            <div style="text-align: center;">
                <a href="%s" class="cta-button">
                    📚 DETAIL BOOKING
                </a>
            </div>

            <div class="info-box">
                    <strong>⏳ Apa Selanjutnya:</strong> Tutor akan menerima notifikasi tentang permintaan Anda. Biasanya tutor akan merespons dalam 6 jam. Kami akan segera mengirimkan email kepada Anda begitu tutor merespons.
                </div>

            <div class="message" style="font-size: 14px; color: #718096;">
                    Jika tombol di atas tidak berfungsi, salin dan tempel tautan ini ke browser Anda:<br><br>
                    <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">%s</code>
                </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>`

	templateBookingCourseTutor = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Permintaan Booking Baru dari %s</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-top: 10px;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* BOOKING DETAIL BOX - CARD STYLE */
        .booking-detail-box {
            background: white;
            border-radius: 12px;
            padding: 0;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .booking-detail-box h3 {
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            font-size: 18px;
            padding: 15px 20px;
            margin: 0;
            font-weight: bold;
        }

        .booking-content {
            padding: 25px;
        }

        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .section-type {
            font-size: 14px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 25px;
        }

        .section-content {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
            line-height: 1.5;
        }

        .section-content.large {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .time-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 8px 18px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        .type-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 14px 26px;
            border-radius: 22px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .notes-box {
            background: #f7fafc;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #4a5568;
            line-height: 1.6;
        }

        .notes-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .cta-button.secondary {
            background: linear-gradient(45deg, #10b981, #059669);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .cta-button.danger {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .success-box h3 {
            color: #10b981;
            margin-bottom: 10px;
        }

        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .warning-box h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }

        .status-accepted {
            background: #d1fae5;
            color: #065f46;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        .template-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .template-selector select {
            padding: 10px;
            border: 2px solid #8b5cf6;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        }

        .email-template {
            display: none;
        }

        .email-template.active {
            display: block;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
                width: 100%%;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                min-width: 100%%;
                margin-bottom: 5px;
            }

            .button-group {
                flex-direction: column;
            }

            .template-selector {
                position: static;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1><h1>🎓 Permintaan Booking Baru!</h1></h1>
        </div>

        <div class="content">
            <div class="welcome-text">
                Halo %s,
            </div>

            <div class="message">
                Kabar baik! Kamu baru saja menerima permintaan les privat dari %s!
            </div>

            <!-- BOOKING DETAIL BOX -->
                <div class="booking-detail-box">
                    <h3>%s</h3>

                    <div class="booking-content">
                        <div class="detail-section">
                            <div class="section-type"><span class="type-badge">%s</span></div>
                            <div class="section-content large">%s</div>
                            <div class="section-content large">%s %s<span class="time-badge">1 Jam</span></div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Permintaan lokasi</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Catatan Booking</div>
                            <div class="section-content">%s</div>
                        </div>
                    </div>
                </div>

            <div style="text-align: center;">
                <a href="%s" class="cta-button">
                    📚 DETAIL BOOKING
                </a>
            </div>

            <div class="info-box">
                    <strong>💡 Tips:</strong> Segera respons permintaan ini untuk meningkatkan peluang diterima. Siswa biasanya menunggu konfirmasi dalam 6 jam.
                </div>

            <div class="message" style="font-size: 14px; color: #718096;">
                    Jika tombol di atas tidak berfungsi, salin dan tempel tautan ini ke browser Anda:<br><br>
                    <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">%s</code>
                </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`

	templateUpdateStatusBookingTutor = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status Booking Les Private</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-top: 10px;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* BOOKING DETAIL BOX - CARD STYLE */
        .booking-detail-box {
            background: white;
            border-radius: 12px;
            padding: 0;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .booking-detail-box h3 {
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            font-size: 18px;
            padding: 15px 20px;
            margin: 0;
            font-weight: bold;
        }

        .booking-content {
            padding: 25px;
        }

        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .section-type {
            font-size: 14px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 25px;
        }

        .section-content {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
            line-height: 1.5;
        }

        .section-content.large {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .time-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 8px 18px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        .type-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 14px 26px;
            border-radius: 22px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .notes-box {
            background: #f7fafc;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #4a5568;
            line-height: 1.6;
        }

        .notes-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .cta-button.secondary {
            background: linear-gradient(45deg, #10b981, #059669);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .cta-button.danger {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .success-box h3 {
            color: #10b981;
            margin-bottom: 10px;
        }

        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .warning-box h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }

        .status-accepted {
            background: #d1fae5;
            color: #065f46;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        .template-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .template-selector select {
            padding: 10px;
            border: 2px solid #8b5cf6;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        }

        .email-template {
            display: none;
        }

        .email-template.active {
            display: block;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
                width: 100%%;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                min-width: 100%%;
                margin-bottom: 5px;
            }

            .button-group {
                flex-direction: column;
            }

            .template-selector {
                position: static;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1><h1>Konfirmasi Status Booking %s</h1></h1>
        </div>

        <div class="content">
            <div class="welcome-text">
                Halo %s,
            </div>

             <div class="success-box">
                    <h3>✅ Booking Dikonfirmasi</h3>
                    <p style="color: #065f46;">Terima kasih telah mengonfirmasi booking dari <strong>%s</strong>. Siswa telah menerima notifikasi konfirmasi.</p>
            </div>

            <!-- BOOKING DETAIL BOX -->
                <div class="booking-detail-box">
                    <h3>%s</h3>

                    <div class="booking-content">
                        <div class="detail-section">
                            <div class="section-type"><span class="type-badge">%s</span></div>
                            <div class="section-content large">%s</div>
                            <div class="section-content large">%s %s <span class="time-badge">1 Jam</span></div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Permintaan lokasi</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Catatan Booking</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-row">
						%s

                        <div>

                    </div>
                    </div>
                    </div>
                </div>


                <div class="message" style="font-size: 14px; color: #718096; text-align: center; margin-top: 20px;">
                    Nomor Booking: <strong>%s</strong>
                </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`

	templateUpdateStatusBookingStudent = `
	<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status Booking Les Private</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-top: 10px;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* BOOKING DETAIL BOX - CARD STYLE */
        .booking-detail-box {
            background: white;
            border-radius: 12px;
            padding: 0;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .booking-detail-box h3 {
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            font-size: 18px;
            padding: 15px 20px;
            margin: 0;
            font-weight: bold;
        }

        .booking-content {
            padding: 25px;
        }

        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .section-type {
            font-size: 14px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 25px;
        }

        .section-content {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
            line-height: 1.5;
        }

        .section-content.large {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .time-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 8px 18px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        .type-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 14px 26px;
            border-radius: 22px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .notes-box {
            background: #f7fafc;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #4a5568;
            line-height: 1.6;
        }

        .notes-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .cta-button.secondary {
            background: linear-gradient(45deg, #10b981, #059669);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .cta-button.danger {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .success-box h3 {
            color: #10b981;
            margin-bottom: 10px;
        }

        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .warning-box h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }

        .status-accepted {
            background: #d1fae5;
            color: #065f46;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        .template-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .template-selector select {
            padding: 10px;
            border: 2px solid #8b5cf6;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        }

        .email-template {
            display: none;
        }

        .email-template.active {
            display: block;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
                width: 100%%;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                min-width: 100%%;
                margin-bottom: 5px;
            }

            .button-group {
                flex-direction: column;
            }

            .template-selector {
                position: static;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1><h1>Konfirmasi Status Booking %s</h1></h1>
        </div>

        <div class="content">
            <div class="welcome-text">
                Halo %s,
            </div>

			%s

            <!-- BOOKING DETAIL BOX -->
                <div class="booking-detail-box">
                    <h3>%s</h3>

                    <div class="booking-content">
                        <div class="detail-section">
                            <div class="section-type"><span class="type-badge">%s</span></div>
                            <div class="section-content large">%s</div>
                            <div class="section-content large">%s %s <span class="time-badge">1 Jam</span></div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Permintaan lokasi</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Catatan Booking</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-row">
						%s

                        <div class="notes-box">
                        <strong>💬 Catatan dari Tutor:</strong><br>
                        %s
                    </div>
                    </div>
                    </div>
                </div>

				%s


                <div class="message" style="font-size: 14px; color: #718096; text-align: center; margin-top: 20px;">
                    Nomor Booking: <strong>%s</strong>
                </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`

	templateSendReviewBookingTutor = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beri Ulasan untuk Siswa</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-top: 10px;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* BOOKING DETAIL BOX - CARD STYLE */
        .booking-detail-box {
            background: white;
            border-radius: 12px;
            padding: 0;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .booking-detail-box h3 {
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            font-size: 18px;
            padding: 15px 20px;
            margin: 0;
            font-weight: bold;
        }

        .booking-content {
            padding: 25px;
        }

        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .section-type {
            font-size: 14px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 25px;
        }

        .section-content {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
            line-height: 1.5;
        }

        .section-content.large {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .time-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 8px 18px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        .type-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 14px 26px;
            border-radius: 22px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .notes-box {
            background: #f7fafc;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #4a5568;
            line-height: 1.6;
        }

        .notes-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .cta-button.secondary {
            background: linear-gradient(45deg, #10b981, #059669);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .cta-button.danger {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .success-box h3 {
            color: #10b981;
            margin-bottom: 10px;
        }

        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .warning-box h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }

        .status-accepted {
            background: #d1fae5;
            color: #065f46;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        .template-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .template-selector select {
            padding: 10px;
            border: 2px solid #8b5cf6;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        }

        .email-template {
            display: none;
        }

        .email-template.active {
            display: block;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
                width: 100%%;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                min-width: 100%%;
                margin-bottom: 5px;
            }

            .button-group {
                flex-direction: column;
            }

            .template-selector {
                position: static;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1><h1>Beri Ulasan untuk Siswa 👨🏻‍🎓</h1></h1>
            <p>Kami ingin mendengar pengalaman Anda</p>
        </div>

        <div class="content">
            <div class="welcome-text">
                Halo %s,
            </div>

            <div class="message">
                Terima kasih telah menyelesaikan sesi les privat dengan %s. Kami harap Anda mendapatkan pengalaman mengajar yang menyenangkan!
            </div>

            <!-- BOOKING DETAIL BOX -->
                <div class="booking-detail-box">
                    <h3>%s</h3>

                    <div class="booking-content">
                        <div class="detail-section">
                            <div class="section-type"><span class="type-badge">%s</span></div>
                            <div class="section-content large">%s</div>
                            <div class="section-content large">%s %s <span class="time-badge">1 Jam</span></div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Permintaan lokasi</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Catatan Booking</div>
                            <div class="section-content">%s</div>
                        </div>
                    </div>
                </div>

            <div style="text-align: center;">
                <a href="%s" class="cta-button">
                    📚 BERI ULASAN
                </a>
            </div>


            <div class="message" style="font-size: 14px; color: #718096;">
                    Jika tombol di atas tidak berfungsi, salin dan tempel tautan ini ke browser Anda:<br><br>
                    <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">%s</code>
                </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`

	templateSendReviewBookingStudent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bagaimana Les Anda?</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-top: 10px;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* BOOKING DETAIL BOX - CARD STYLE */
        .booking-detail-box {
            background: white;
            border-radius: 12px;
            padding: 0;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .booking-detail-box h3 {
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            font-size: 18px;
            padding: 15px 20px;
            margin: 0;
            font-weight: bold;
        }

        .booking-content {
            padding: 25px;
        }

        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .section-type {
            font-size: 14px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 25px;
        }

        .section-content {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
            line-height: 1.5;
        }

        .section-content.large {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .time-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 8px 18px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        .type-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 14px 26px;
            border-radius: 22px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .notes-box {
            background: #f7fafc;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #4a5568;
            line-height: 1.6;
        }

        .notes-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .cta-button.secondary {
            background: linear-gradient(45deg, #10b981, #059669);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .cta-button.danger {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .success-box h3 {
            color: #10b981;
            margin-bottom: 10px;
        }

        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .warning-box h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }

        .status-accepted {
            background: #d1fae5;
            color: #065f46;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        .template-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .template-selector select {
            padding: 10px;
            border: 2px solid #8b5cf6;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        }

        .email-template {
            display: none;
        }

        .email-template.active {
            display: block;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
                width: 100%%;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                min-width: 100%%;
                margin-bottom: 5px;
            }

            .button-group {
                flex-direction: column;
            }

            .template-selector {
                position: static;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1><h1>Bagaimana Les Anda? 👨🏻‍🎓</h1></h1>
            <p>Kami ingin mendengar pengalaman Anda</p>
        </div>

        <div class="content">
            <div class="welcome-text">
                Halo %s,
            </div>

            <div class="message">
                Terima kasih telah menyelesaikan sesi les privat dengan %s. Kami harap Anda mendapatkan pengalaman belajar yang menyenangkan!
            </div>

            <!-- BOOKING DETAIL BOX -->
                <div class="booking-detail-box">
                    <h3>%s</h3>

                    <div class="booking-content">
                        <div class="detail-section">
                            <div class="section-type"><span class="type-badge">%s</span></div>
                            <div class="section-content large">%s</div>
                            <div class="section-content large">%s %s <span class="time-badge">1 Jam</span></div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Permintaan lokasi</div>
                            <div class="section-content">%s</div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Catatan Booking</div>
                            <div class="section-content">%s</div>
                        </div>
                    </div>
                </div>

            <div style="text-align: center;">
                <a href="%s" class="cta-button">
                    📚 BERI ULASAN
                </a>
            </div>


            <div class="message" style="font-size: 14px; color: #718096;">
                    Jika tombol di atas tidak berfungsi, salin dan tempel tautan ini ke browser Anda:<br><br>
                    <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">%s</code>
                </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`

	templateSubmitReviewTutor = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kamu Mendapatkan Ulasan!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            padding: 20px;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            padding: 30px 40px;
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-top: 10px;
        }

        .content {
            padding: 40px;
        }

        .welcome-text {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .message {
            font-size: 16px;
            color: #2d3748;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* BOOKING DETAIL BOX - CARD STYLE */
        .booking-detail-box {
            background: white;
            border-radius: 12px;
            padding: 0;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .booking-detail-box h3 {
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            font-size: 18px;
            padding: 15px 20px;
            margin: 0;
            font-weight: bold;
        }

        .booking-content {
            padding: 25px;
        }

        .detail-section {
            margin-bottom: 20px;
            text-align: center;
        }

        .detail-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .section-type {
            font-size: 14px;
            font-weight: bold;
            color: #8b5cf6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 25px;
        }

        .section-content {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
            line-height: 1.5;
        }

        .section-content.large {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .section-content.xlarge {
            font-size: 25px;
            font-weight: bold;
            color: #8b5cf6;
            align-items: center;

        }

        .time-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 8px 18px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        .type-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%%, #a855f7 100%%);
            color: white;
            padding: 14px 26px;
            border-radius: 22px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }

        .notes-box {
            background: #f7fafc;
            border-left: 3px solid #8b5cf6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            color: #4a5568;
            line-height: 1.6;
        }

        .notes-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 8px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #8b5cf6, #a855f7);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
            text-align: center;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
        }

        .cta-button.secondary {
            background: linear-gradient(45deg, #10b981, #059669);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .cta-button.danger {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .info-box {
            background: #f7fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #4a5568;
        }

        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .success-box h3 {
            color: #10b981;
            margin-bottom: 10px;
        }

        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }

        .warning-box h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }

        .status-accepted {
            background: #d1fae5;
            color: #065f46;
        }

        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }

        .template-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .template-selector select {
            padding: 10px;
            border: 2px solid #8b5cf6;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        }

        .email-template {
            display: none;
        }

        .email-template.active {
            display: block;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }

            .header, .content, .footer {
                padding: 25px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .welcome-text {
                font-size: 16px;
            }

            .cta-button {
                padding: 12px 25px;
                font-size: 15px;
                width: 100%%;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                min-width: 100%%;
                margin-bottom: 5px;
            }

            .button-group {
                flex-direction: column;
            }

            .template-selector {
                position: static;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/lesprivate/assets/refs/heads/main/lesprivate-logo.png" alt="Logo Lesprivate" class="logo">
            <h1><h1>Kamu Mendapatkan Ulasan! 🙌”</h1></h1>
        </div>

        <div class="content">
            <div class="welcome-text">
                Halo %s,
            </div>

            <div class="message">
                Student %s telah memberikan ulasan atas sesi les %s. Yuk, cek ulasanmu sekarang dan lihat bagaimana pengalaman mereka belajar bersamamu! 💪
            </div>

            <!-- BOOKING DETAIL BOX -->
                <div class="booking-detail-box">
                    <h3>%s</h3>

                    <div class="booking-content">


                        <div class="detail-section">
                            <div class="section-content xlarge" >%s</div>
                        </div>

                        <div class="detail-section">
                            <div class="section-title">Ulasan</div>
                            <div class="section-content">%s</div>
                        </div>
                    </div>
                </div>

            <div style="text-align: center;">
                <a href="%s" class="cta-button">
                    📚 Detail Course
                </a>
            </div>


            <div class="message" style="font-size: 14px; color: #718096;">
                    Jika tombol di atas tidak berfungsi, salin dan tempel tautan ini ke browser Anda:<br><br>
                    <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">%s</code>
                </div>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@lesprivate.com" style="color: #8b5cf6;">support@lesprivate.com</a></p>
            <p>&copy; 2025 Lesprivate. All rights reserved.</p>

            <div class="social-links">
                <a href="#">Privacy Policy</a> |
                <a href="#">Terms of Service</a> |
                <a href="#">Help Center</a>
            </div>
        </div>
    </div>
</body>
</html>
`
)
