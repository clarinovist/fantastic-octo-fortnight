-- Set the email of the user to be promoted to mentor
SET @user_email = 'mentor@test.com';

-- 1. Get the user ID
SELECT id INTO @user_id FROM users WHERE email = @user_email;

-- 2. Insert into user_roles (Assign 'tutor' role)
-- Tutor Role ID from migration: 2090d47f-0616-4dcb-bfcf-4429d3893f16
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES (@user_id, '2090d47f-0616-4dcb-bfcf-4429d3893f16');

-- 3. Insert into tutors (Create Tutor Profile)
-- Generate a new UUID for the tutor
SET @tutor_id = UUID();

INSERT INTO tutors (
    id,
    user_id,
    gender,
    date_of_birth,
    phone_number,
    social_media_link,
    class_type,
    latitude,
    longitude,
    level,
    level_of_education,
    rating,
    total_rating,
    response_time,
    created_at,
    updated_at,
    created_by,
    updated_by, 
    level_point
)
SELECT 
    @tutor_id,
    @user_id,
    'Male',                 -- Gender
    '1995-01-01',           -- Date of Birth
    '081234567890',         -- Phone
    '{"linkedin": "https://linkedin.com/in/mentor", "instagram": "https://instagram.com/mentor"}', -- Social Media
    'all',                  -- Class Type
    -6.200000,              -- Latitude (Jakarta)
    106.816666,             -- Longitude (Jakarta)
    'Beginner',             -- Level
    'Bachelor Degree',      -- Education
    5.0,                    -- Rating
    0,                      -- Total Rating
    60,                     -- Response Time (minutes)
    NOW(),
    NOW(),
    @user_id,
    @user_id,
    0
FROM users 
WHERE email = @user_email
AND NOT EXISTS (SELECT 1 FROM tutors WHERE user_id = @user_id);

-- Output result
SELECT u.email, r.name as role, t.id as tutor_id
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN tutors t ON u.id = t.user_id
WHERE u.email = @user_email;
