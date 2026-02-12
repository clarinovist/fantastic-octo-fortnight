ALTER TABLE course_schedules ADD COLUMN class_type ENUM('online', 'offline') NOT NULL DEFAULT 'offline' AFTER timezone;
