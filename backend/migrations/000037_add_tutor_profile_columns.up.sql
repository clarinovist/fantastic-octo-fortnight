-- Add gender column
ALTER TABLE tutors ADD COLUMN gender VARCHAR(50) NULL AFTER user_id;

-- Add date_of_birth column
ALTER TABLE tutors ADD COLUMN date_of_birth DATE NULL AFTER gender;

-- Add phone_number column
ALTER TABLE tutors ADD COLUMN phone_number VARCHAR(20) NULL AFTER date_of_birth;

-- Add social_media_link JSON column
ALTER TABLE tutors ADD COLUMN social_media_link JSON NULL AFTER phone_number;
