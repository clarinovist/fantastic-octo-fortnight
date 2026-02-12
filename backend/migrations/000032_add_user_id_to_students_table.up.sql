-- Add user_id column as NOT NULL since table is now empty
ALTER TABLE students ADD COLUMN user_id char(36) NULL AFTER id;

-- Add foreign key constraint
ALTER TABLE students ADD CONSTRAINT fk_students_user_id FOREIGN KEY (user_id) REFERENCES users (id);
