package model

import (
	"database/sql/driver"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/config"
)

const (
	TutorStatusActive   = "active"
	TutorStatusInactive = "inactive"
)

type TutorLevel string

const (
	TutorLevelGuru        TutorLevel = "Guru"
	TutorLevelGuruAktif   TutorLevel = "Guru Aktif"
	TutorLevelGuruFavorit TutorLevel = "Guru Favorit"
)

type ClassType string

const (
	AllClassType     ClassType = "all"
	OfflineClassType ClassType = "offline"
	OnlineClassType  ClassType = "online"
)

type OnlineChannel []string

func GetImageURLByOnlineChannel(channel string) string {
	switch strings.ToLower(channel) {
	case "zoom":
		return config.Conf.Image.Zoom
	case "google meet":
		return config.Conf.Image.GoogleMeet
	default:
		return ""
	}
}

// Value implement sql.driver.Valuer
func (oc OnlineChannel) Value() (driver.Value, error) {
	return strings.Join(oc, ","), nil
}

// Scan implement sql.Scanner
func (oc *OnlineChannel) Scan(value interface{}) error {
	if value == nil {
		*oc = nil
		return nil
	}

	switch value := value.(type) {
	case string:
		str := value
		*oc = strings.Split(str, ",")
	case []uint8:
		str := string(value)
		*oc = strings.Split(str, ",")
	default:
		return fmt.Errorf("OnlineChannel.Scanner: invalid type")
	}

	return nil
}

type Tutor struct {
	ID               uuid.UUID           `gorm:"type:char(36);primary_key" json:"id"`
	UserID           uuid.UUID           `gorm:"type:char(36);not null" json:"user_id"`
	User             User                `gorm:"foreignKey:UserID" json:"user"`
	Gender           null.String         `gorm:"type:varchar(50)" json:"gender"`
	DateOfBirth      null.Time           `gorm:"type:date" json:"date_of_birth"`
	PhoneNumber      null.String         `gorm:"type:varchar(20)" json:"phone_number"`
	SocialMediaLink  []SocialMediaLink   `gorm:"serializer:social_media_link" json:"social_media_link"`
	Description      string              `json:"description"`
	PhotoProfile     null.String         `json:"photo_profile"`
	ClassType        ClassType           `gorm:"type:enum('all','offline','online');default:'all'" json:"class_type"`
	OnlineChannel    OnlineChannel       `json:"online_channel"`
	LinkedinLink     null.String         `json:"linkedin_link"`
	TiktokLink       null.String         `json:"tiktok_link"`
	InstagramLink    null.String         `json:"instagram_link"`
	Latitude         decimal.NullDecimal `json:"latitude"`
	Longitude        decimal.NullDecimal `json:"longitude"`
	LocationID       uuid.NullUUID       `gorm:"type:char(36);null" json:"location_id"`
	Location         Location            `gorm:"foreignKey:LocationID" json:"location"`
	Level            null.String         `json:"level"`
	LevelPoint       uint                `gorm:"type:int unsigned;default:0" json:"level_point"`
	LevelOfEducation null.String         `json:"level_of_education"`
	ResponseTime     null.Int            `json:"response_time"`
	Status           null.String         `json:"status"`
<<<<<<< HEAD
=======
	Address          null.String         `json:"address"`
>>>>>>> 1a19ced (chore: update service folders from local)
	CreatedAt        time.Time           `json:"created_at"`
	UpdatedAt        time.Time           `json:"updated_at"`
	DeletedAt        null.Time           `gorm:"index" json:"deleted_at"`
	CreatedBy        uuid.NullUUID       `gorm:"type:char(36)" json:"created_by"`
	UpdatedBy        uuid.NullUUID       `gorm:"type:char(36)" json:"updated_by"`
	DeletedBy        uuid.NullUUID       `gorm:"type:char(36)" json:"deleted_by"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (t *Tutor) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

func (t *Tutor) LevelByPoint() string {
	if t.LevelPoint < 10 {
		return string(TutorLevelGuru)
	}

	if t.LevelPoint < 25 {
		return string(TutorLevelGuruAktif)
	}

	if t.LevelPoint >= 25 {
		return string(TutorLevelGuruFavorit)
	}

	return string(TutorLevelGuru)
}

func (t *Tutor) StatusLabel() string {
	if !t.Status.Valid {
		return TutorStatusInactive
	}

	return t.Status.String
}

func (t *Tutor) IsFinishUpdateProfile() bool {
	return t.Latitude.Valid &&
		t.Longitude.Valid &&
		t.User.Name != "" &&
		t.Gender.Valid &&
		t.DateOfBirth.Valid &&
		len(t.SocialMediaLink) > 0 &&
		t.PhoneNumber.Valid
}

type TutorFilter struct {
	IDs           []uuid.UUID
	UserID        uuid.UUID
	Name          string
	Email         string
	Query         string
	CreatedAtFrom time.Time
	CreatedAtTo   time.Time
	DeletedIsNull null.Bool
	Pagination
	Sort
}
