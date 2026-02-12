ALTER TABLE courses ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT '' AFTER online_channel;
ALTER TABLE courses ADD COLUMN status_notes TEXT NULL AFTER status;
