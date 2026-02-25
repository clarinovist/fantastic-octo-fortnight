package config

import (
	"time"

	"github.com/rs/zerolog/log"
	"github.com/spf13/viper"
)

var Conf = &Config{}

type Config struct {
	App struct {
		CORS struct {
			AllowCredentials bool     `mapstructure:"ALLOW_CREDENTIALS"`
			AllowedHeaders   []string `mapstructure:"ALLOWED_HEADERS"`
			AllowedMethods   []string `mapstructure:"ALLOWED_METHODS"`
			AllowedOrigins   []string `mapstructure:"ALLOWED_ORIGINS"`
			Enable           bool     `mapstructure:"ENABLE"`
			MaxAgeSeconds    int      `mapstructure:"MAX_AGE_SECONDS"`
		}
		Env  string `mapstructure:"ENV"`
		Name string `mapstructure:"NAME"`
		Key  string `mapstructure:"KEY"`
		Log  struct {
			Level string `mapstructure:"LEVEL"`
		} `mapstructure:"LOG"`
		Port string `mapstructure:"PORT"`
		URL  string `mapstructure:"URL"`
	} `mapstructure:"APP"`
	Booking struct {
		ExpiredDuration                   time.Duration `mapstructure:"EXPIRED_DURATION"`
		MaxBookingPerDay                  int           `mapstructure:"MAX_BOOKING_PER_DAY"`
		MaxBookingPerCategory             int           `mapstructure:"MAX_BOOKING_PER_CATEGORY"`
		MaxBookingFreeFirstCourse         int           `mapstructure:"MAX_BOOKING_FREE_FIRST_COURSE"`
		ReminderBeforeExpiredDuration     time.Duration `mapstructure:"REMINDER_BEFORE_EXPIRED_DURATION"`
		ReminderBeforeBookingDateDuration time.Duration `mapstructure:"REMINDER_BEFORE_BOOKING_DATE_DURATION"`
		CreateReviewDuration              time.Duration `mapstructure:"CREATE_REVIEW_DURATION"`
	} `mapstructure:"BOOKING"`
	Review struct {
		MaxEditedDuration time.Duration `mapstructure:"MAX_EDITED_DURATION"`
	} `mapstructure:"REVIEW"`
	DB struct {
		Read struct {
			Host     string `mapstructure:"HOST"`
			Name     string `mapstructure:"NAME"`
			Password string `mapstructure:"PASSWORD"`
			Port     string `mapstructure:"PORT"`
			Timezone string `mapstructure:"TIMEZONE"`
			Username string `mapstructure:"USER"`
		}
		Write struct {
			Host            string `mapstructure:"HOST"`
			Name            string `mapstructure:"NAME"`
			Password        string `mapstructure:"PASSWORD"`
			Port            string `mapstructure:"PORT"`
			Timezone        string `mapstructure:"TIMEZONE"`
			Username        string `mapstructure:"USER"`
			EnableMigration bool   `mapstructure:"ENABLE_MIGRATION"`
		}
	} `mapstructure:"DB"`
	Frontend struct {
		BaseURL             string `mapstructure:"BASE_URL"`
		AdminBaseURL        string `mapstructure:"ADMIN_BASE_URL"`
		MentorBaseURL       string `mapstructure:"MENTOR_BASE_URL"`
		Account             string `mapstructure:"ACCOUNT"`
		VerifyEmailPath     string `mapstructure:"VERIFY_EMAIL_PATH"`
		ResetPasswordPath   string `mapstructure:"RESET_PASSWORD_PATH"`
		BookingDetail       string `mapstructure:"BOOKING_DETAIL"`
		DetailCourse        string `mapstructure:"DETAIL_COURSE"`
		ListCourse          string `mapstructure:"LIST_COURSE"`
		SubscriptionSuccess string `mapstructure:"SUBSCRIPTION_SUCCESS"`
		SubscriptionFailure string `mapstructure:"SUBSCRIPTION_FAILURE"`
	} `mapstructure:"FRONTEND"`
	GoogleMaps struct {
		ApiKey string `mapstructure:"API_KEY"`
	} `mapstructure:"GOOGLE_MAPS"`
	GoogleOAuth struct {
		ClientID     string `mapstructure:"CLIENT_ID"`
		ClientSecret string `mapstructure:"CLIENT_SECRET"`
	} `mapstructure:"GOOGLE_OAUTH"`
	Image struct {
		GoogleMeet string `mapstructure:"GOOGLE_MEET"`
		Instagram  string `mapstructure:"INSTAGRAM"`
		Linkedin   string `mapstructure:"LINKEDIN"`
		Tiktok     string `mapstructure:"TIKTOK"`
		Zoom       string `mapstructure:"ZOOM"`
	} `mapstructure:"IMAGE"`
	JWT struct {
		Key              string        `mapstructure:"KEY"`
		ExpiresIn        time.Duration `mapstructure:"EXPIRES_IN"`
		RefreshExpiresIn time.Duration `mapstructure:"REFRESH_EXPIRES_IN"`
	} `mapstructure:"JWT"`
	Linode struct {
		Endpoint   string `mapstructure:"ENDPOINT"`
		AccessKey  string `mapstructure:"ACCESS_KEY"`
		SecretKey  string `mapstructure:"SECRET_KEY"`
		Region     string `mapstructure:"REGION"`
		BucketName string `mapstructure:"BUCKET_NAME"`
		BucketURL  string `mapstructure:"BUCKET_URL"`
	} `mapstructure:"LINODE"`
	Location struct {
		DefaultRadius int `mapstructure:"DEFAULT_RADIUS"`
	} `mapstructure:"LOCATION"`
	Mail struct {
		Name     string `mapstructure:"NAME"`
		Email    string `mapstructure:"EMAIL"`
		Password string `mapstructure:"PASSWORD"`
		Host     string `mapstructure:"HOST"`
		Port     string `mapstructure:"PORT"`
	} `mapstructure:"MAIL"`
	Resend struct {
		ApiKey string `mapstructure:"API_KEY"`
		From   string `mapstructure:"FROM"`
	} `mapstructure:"RESEND"`
	Notification struct {
		RetentionDuration time.Duration `mapstructure:"RETENTION_DURATION"`
	} `mapstructure:"NOTIFICATION"`
	Redis struct {
		DB         int    `mapstructure:"DB"`
		Host       string `mapstructure:"HOST"`
		MaxRetries int    `mapstructure:"MAX_RETRIES"`
		Password   string `mapstructure:"PASSWORD"`
		Port       string `mapstructure:"PORT"`
	} `mapstructure:"REDIS"`
	File struct {
		MaxUploadSize int64 `mapstructure:"MAX_UPLOAD_SIZE"`
	} `mapstructure:"FILE"`
	Subscription struct {
		AmountMonthly float64 `mapstructure:"AMOUNT_MONTHLY"`
		AmountYearly  float64 `mapstructure:"AMOUNT_YEARLY"`
	} `mapstructure:"SUBSCRIPTION"`
	Xendit struct {
		BaseURL    string `mapstructure:"BASE_URL"`
		SecretKey  string `mapstructure:"SECRET_KEY"`
		WebhookKey string `mapstructure:"WEBHOOK_KEY"`
	} `mapstructure:"XENDIT"`
}

func Load() *Config {
	viper.SetConfigFile(".env")
	err := viper.ReadInConfig()
	if err != nil {
		log.Panic().Err(err).Msg("error load .env")
	}

	err = viper.Unmarshal(&Conf)
	if err != nil {
		log.Panic().Err(err).Msg("error unmarshal env")
	}

	return Conf
}
