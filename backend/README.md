# Les Private Backend

A comprehensive backend API service for Les Private, an online private tutoring platform built with Go. This service handles course management, booking systems, user authentication, payment processing, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)

## Features

- **User Management**: Authentication and authorization with JWT tokens, OAuth2 (Google), role-based access control
- **Course Management**: Create, update, and manage private tutoring courses with categories and locations
- **Booking System**: Schedule and manage lesson bookings with automated reminders and expiration handling
- **Payment Integration**: Xendit payment gateway integration for subscriptions and transactions
- **Review System**: Course and tutor rating and review functionality
- **Notification System**: Real-time notifications for bookings, payments, and system events
- **Subscription Management**: Monthly and yearly subscription plans
- **Location Services**: Google Maps integration for location-based course search
- **Email Service**: Automated email notifications for various events
- **File Storage**: AWS S3-compatible object storage for media files
- **PDF Generation**: wkhtmltopdf integration for generating documents

## Tech Stack

- **Language**: Go 1.24
- **Web Framework**: Chi Router
- **ORM**: GORM
- **Database**: MySQL
- **Cache**: Redis
- **Authentication**: JWT, OAuth2 (Google)
- **Payment Gateway**: Xendit
- **Email**: SMTP with gomail
- **Maps**: Google Maps API
- **Object Storage**: AWS S3 SDK
- **API Documentation**: Swagger/OpenAPI
- **Dependency Injection**: Google Wire
- **Logging**: Zerolog
- **Migration**: golang-migrate

## Database Schema

The application uses a comprehensive relational database schema to manage all aspects of the tutoring platform:

![Database ERD](ERD.png)

### Key Entities

- **Users**: Student and tutor accounts with authentication
- **Courses**: Tutoring courses with categories, locations, and pricing
- **Bookings**: Lesson scheduling and management
- **Payments**: Transaction records and subscription management
- **Reviews**: Course and tutor ratings
- **Notifications**: User notification system
- **Subscriptions**: Premium membership plans

## Prerequisites

- Go 1.24 or higher
- MySQL 8.0 or higher
- Redis 6.0 or higher
- Docker and Docker Compose (optional)
- Google Maps API key
- Xendit API credentials
- SMTP server credentials

## Installation

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/lesprivate/backend.git
cd backend
```

2. Install dependencies:
```bash
go mod download
```

3. Install development tools:
```bash
go install github.com/swaggo/swag/cmd/swag@latest
go install github.com/google/wire/cmd/wire@latest
```

4. Generate code:
```bash
go generate ./...
```

### Docker Setup

1. Ensure Docker and Docker Compose are installed
2. Create a Docker network:
```bash
docker network create lesprivate
```

3. Build and run:
```bash
docker-compose up -d
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure the following required environment variables in `.env`:

### Application Settings
```env
APP.ENV=development
APP.NAME=les-private
APP.PORT=8080
APP.URL=http://localhost:8080
APP.KEY=your-app-key
APP.LOG.LEVEL=info
```

### Database Configuration
```env
DB.WRITE.HOST=localhost
DB.WRITE.NAME=lesprivate
DB.WRITE.USER=root
DB.WRITE.PASSWORD=your-password
DB.WRITE.PORT=3306
DB.WRITE.ENABLE_MIGRATION=true

DB.READ.HOST=localhost
DB.READ.NAME=lesprivate
DB.READ.USER=root
DB.READ.PASSWORD=your-password
DB.READ.PORT=3306
```

### Redis Configuration
```env
REDIS.HOST=localhost
REDIS.PORT=6379
REDIS.PASSWORD=
REDIS.DB=0
```

### JWT Configuration
```env
JWT.KEY=your-jwt-secret-key
JWT.EXPIRES_IN=1h
JWT.REFRESH_EXPIRES_IN=24h
```

### External Services
```env
GOOGLE_MAPS.API_KEY=your-google-maps-api-key
GOOGLE_OAUTH.CLIENT_ID=your-google-oauth-client-id
GOOGLE_OAUTH.CLIENT_SECRET=your-google-oauth-client-secret

XENDIT.BASE_URL=https://api.xendit.co
XENDIT.SECRET_KEY=your-xendit-secret-key
XENDIT.WEBHOOK_KEY=your-xendit-webhook-key

MAIL.HOST=mail.lesprivate.id
MAIL.PORT=465
MAIL.EMAIL=dev@lesprivate.id
MAIL.PASSWORD=your-mail-password
```

### Booking Configuration
```env
BOOKING.EXPIRED_DURATION=6h
BOOKING.MAX_BOOKING_PER_DAY=5
BOOKING.REMINDER_BEFORE_EXPIRED_DURATION=1h
BOOKING.REMINDER_BEFORE_BOOKING_DATE_DURATION=24h
```

## Running the Application

### Local Development

```bash
go run main.go
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

### Using Docker

```bash
docker-compose up
```

The application will be available on `http://localhost:8082`.

### Running Migrations

Migrations are automatically run on startup if `DB.WRITE.ENABLE_MIGRATION=true` is set in your `.env` file.

To manually run migrations:
```bash
migrate -path migrations -database "mysql://user:password@tcp(localhost:3306)/lesprivate" up
```

## API Documentation

API documentation is automatically generated using Swagger and available at:

```
http://localhost:8080/swagger/index.html
```

To regenerate the Swagger documentation:
```bash
swag init
```

### Authentication

Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
.
├── config/              # Configuration management
├── docs/                # Swagger documentation
├── external/            # External service integrations
├── infras/              # Infrastructure setup (database, redis, etc.)
├── internal/
│   ├── handlers/        # HTTP request handlers
│   ├── model/           # Domain models and entities
│   ├── repositories/    # Data access layer
│   └── services/        # Business logic layer
├── migrations/          # Database migration files
├── shared/              # Shared utilities and helpers
├── templates/           # Email and PDF templates
├── transport/           # HTTP transport layer
├── main.go              # Application entry point
├── wire.go              # Dependency injection configuration
└── docker-compose.yml   # Docker compose configuration
```

## Development

### Code Generation

The project uses code generation for dependency injection and API documentation:

```bash
# Generate all
go generate ./...

# Generate Swagger docs only
swag init

# Generate Wire dependencies only
wire
```

### Adding New Migrations

```bash
migrate create -ext sql -dir migrations -seq migration_name
```

### Running Tests

```bash
go test ./...
```

### Code Style

This project follows standard Go conventions. Format your code using:

```bash
go fmt ./...
```

### Dependency Injection

The project uses Google Wire for dependency injection. All dependencies are wired in `wire.go` and generated in `wire_gen.go`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email dev@lesprivate.id or contact the development team.
