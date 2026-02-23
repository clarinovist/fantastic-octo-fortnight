package main

import (
	"context"
	"fmt"
	"log"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm/schema"
)

func main() {
	schema.RegisterSerializer("social_media_link", model.SocialMediaLink{})
	c := config.Load()

	db := infras.NewMySQL(c)
	if db == nil {
		log.Fatal("failed to connect to db")
	}

	var user model.User
	err := db.Read.WithContext(context.Background()).
		Joins("JOIN user_roles ON users.id = user_roles.user_id").
		Joins("JOIN roles ON user_roles.role_id = roles.id").
		Where("roles.name = ?", "admin").
		First(&user).Error

	if err != nil {
		log.Fatal("Find error:", err)
	}

	passwordsToTest := []string{"password", "password123", "admin", "admin123", "12345678"}
	for _, p := range passwordsToTest {
		err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(p))
		if err == nil {
			fmt.Printf("\nSUCCESS! The password for %s is '%s'\n", user.Email, p)
			return
		}
	}
	fmt.Println("None of the common passwords matched.")
}
