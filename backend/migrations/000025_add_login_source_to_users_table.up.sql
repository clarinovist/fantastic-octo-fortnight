ALTER TABLE users ADD COLUMN login_source ENUM('email', 'google') NOT NULL DEFAULT 'email';
