-- Add photo_profile column
ALTER TABLE students ADD COLUMN photo_profile VARCHAR(255) NULL AFTER user_id;

-- Add gender column
ALTER TABLE students ADD COLUMN gender VARCHAR(50) NULL AFTER photo_profile;

-- Add date_of_birth column
ALTER TABLE students ADD COLUMN date_of_birth DATE NULL AFTER gender;

-- Add phone_number column
ALTER TABLE students ADD COLUMN phone_number VARCHAR(20) NULL AFTER date_of_birth;

-- Add social_media_link JSON column
ALTER TABLE students ADD COLUMN social_media_link JSON NULL AFTER phone_number;
