ALTER TABLE tutors ADD COLUMN user_id char(36) NULL AFTER id;
ALTER TABLE tutors ADD CONSTRAINT fk_tutors_user_id FOREIGN KEY (user_id) REFERENCES users (id);
