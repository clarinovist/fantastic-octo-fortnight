package infras

import (
	"errors"
	"fmt"
	"net/url"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/rs/zerolog/log"
	gormmysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/lesprivate/backend/config"
)

const (
	maxIdleConnection = 10
	maxOpenConnection = 10
	maxLifeTime       = 5 * time.Minute
)

type MySQL struct {
	Read  *gorm.DB
	Write *gorm.DB
}

type mysqlConfig struct {
	Name     string
	Host     string
	Port     string
	Username string
	Password string
	Timezone string
}

func (c *mysqlConfig) Connect() *gorm.DB {
	descriptor := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8&loc=%s&parseTime=true&multiStatements=true",
		c.Username,
		c.Password,
		c.Host,
		c.Port,
		c.Name,
		url.QueryEscape(c.Timezone))

	gormDB, err := gorm.Open(gormmysql.New(gormmysql.Config{
		DSN: descriptor,
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		panic(err)
	}

	db, err := gormDB.DB()
	if err != nil {
		panic(err)
	}

	db.SetMaxIdleConns(maxIdleConnection)
	db.SetMaxOpenConns(maxOpenConnection)
	db.SetConnMaxLifetime(maxLifeTime)

	return gormDB
}

func NewMySQL(c *config.Config) *MySQL {
	read := mysqlConfig{
		Name:     c.DB.Read.Name,
		Host:     c.DB.Read.Host,
		Port:     c.DB.Read.Port,
		Username: c.DB.Read.Username,
		Password: c.DB.Read.Password,
		Timezone: c.DB.Read.Timezone,
	}
	write := mysqlConfig{
		Name:     c.DB.Write.Name,
		Host:     c.DB.Write.Host,
		Port:     c.DB.Write.Port,
		Username: c.DB.Write.Username,
		Password: c.DB.Write.Password,
		Timezone: c.DB.Write.Timezone,
	}
	gormRead := read.Connect()
	gormWrite := write.Connect()
	m := &MySQL{
		Read:  gormRead,
		Write: gormWrite,
	}

	if c.DB.Write.EnableMigration {
		m.RunMigration(c)
	}

	return m
}

func ProvideGORM(m *MySQL) *gorm.DB {
	return m.Write
}

func (m *MySQL) RunMigration(c *config.Config) {
	db, err := m.Write.DB()
	if err != nil {
		panic(err)
	}

	log.Info().Msg("MySQL Migrating...")
	driver, err := mysql.WithInstance(db, &mysql.Config{
		DatabaseName: c.DB.Write.Name,
	})
	if err != nil {
		log.Fatal().Err(err).Msg("error mysql instance")
	}

	mgr, err := migrate.NewWithDatabaseInstance("file://./migrations", "mysql", driver)
	if err != nil {
		log.Fatal().Err(err).Msg("migrating failed")
	}

	err = mgr.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatal().Err(err).Msgf("An error occurred while syncing the database.. %v", err)
	}
	log.Info().Msg("MySQL Migrate Finished...")
}
