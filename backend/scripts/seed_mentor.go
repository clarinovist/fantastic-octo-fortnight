package main

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/internal/model"
)

func main() {
	// Root password from .env is 'password'
	dsn := "root:password@tcp(127.0.0.1:3306)/lesprivate?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// 1. Ensure Tutor Role exists
	var role model.Role
	err = db.Where("name = ?", model.RoleNameTutor).First(&role).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			role = model.Role{
				ID:   uuid.New(),
				Name: model.RoleNameTutor,
			}
			if err := db.Create(&role).Error; err != nil {
				log.Fatalf("failed to create tutor role: %v", err)
			}
			fmt.Println("Created 'tutor' role.")
		} else {
			log.Fatalf("failed to query role: %v", err)
		}
	}

	// 2. Create Mentor User
	email := "mentor@test.com"
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	var user model.User
	err = db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			user = model.User{
				ID:          uuid.New(),
				Name:        "Test Mentor",
				Email:       email,
				Password:    string(hashedPassword),
				LoginSource: model.LoginSourceEmail,
				VerifiedAt:  null.TimeFrom(time.Now()),
			}
			if err := db.Create(&user).Error; err != nil {
				log.Fatalf("failed to create user: %v", err)
			}
			fmt.Printf("Created user: %s\n", email)
		} else {
			log.Fatalf("failed to query user: %v", err)
		}
	} else {
		// Update password and mark as verified if exists
		user.Password = string(hashedPassword)
		user.VerifiedAt = null.TimeFrom(time.Now())
		db.Save(&user)
		fmt.Printf("User %s updated (password & verified status).\n", email)
	}

	// 3. Assign Role to User
	var count int64
	db.Table("user_roles").Where("user_id = ? AND role_id = ?", user.ID, role.ID).Count(&count)
	if count == 0 {
		userRole := model.UserRole{
			UserID: user.ID,
			RoleID: role.ID,
		}
		if err := db.Create(&userRole).Error; err != nil {
			log.Fatalf("failed to assign role: %v", err)
		}
		fmt.Println("Assigned 'tutor' role to user.")
	} else {
		fmt.Println("User already has 'tutor' role.")
	}

	fmt.Println("--- SUCCESS ---")
	fmt.Printf("Login: %s\n", email)
	fmt.Printf("Pass:  %s\n", password)
}
