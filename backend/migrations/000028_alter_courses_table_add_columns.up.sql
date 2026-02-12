ALTER TABLE courses 
ADD COLUMN tutor_description TEXT AFTER description,
ADD COLUMN class_type ENUM('all', 'online', 'offline') NOT NULL DEFAULT 'all' AFTER is_free_first_course,
ADD COLUMN online_channel TEXT AFTER class_type;
