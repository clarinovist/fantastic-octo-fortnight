ALTER TABLE students ADD COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'active' AFTER premium_until;
