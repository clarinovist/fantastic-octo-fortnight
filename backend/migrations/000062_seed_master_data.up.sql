-- Seed Course Categories
-- Ensure 'Akademik' exists and get its ID
SET @akademik_id = (SELECT id FROM course_categories WHERE name = 'Akademik' LIMIT 1);
-- If not exists, insert it
INSERT INTO course_categories (id, name, created_at, updated_at)
SELECT UUID(), 'Akademik', NOW(), NOW()
WHERE @akademik_id IS NULL;
-- Re-fetch ID
SET @akademik_id = (SELECT id FROM course_categories WHERE name = 'Akademik' LIMIT 1);

-- Ensure 'Musik' exists
SET @musik_id = (SELECT id FROM course_categories WHERE name = 'Musik' LIMIT 1);
INSERT INTO course_categories (id, name, created_at, updated_at)
SELECT UUID(), 'Musik', NOW(), NOW()
WHERE @musik_id IS NULL;
SET @musik_id = (SELECT id FROM course_categories WHERE name = 'Musik' LIMIT 1);

-- Ensure 'Olahraga' exists
SET @olahraga_id = (SELECT id FROM course_categories WHERE name = 'Olahraga' LIMIT 1);
INSERT INTO course_categories (id, name, created_at, updated_at)
SELECT UUID(), 'Olahraga', NOW(), NOW()
WHERE @olahraga_id IS NULL;
SET @olahraga_id = (SELECT id FROM course_categories WHERE name = 'Olahraga' LIMIT 1);

-- Ensure 'Bahasa' exists
SET @bahasa_id = (SELECT id FROM course_categories WHERE name = 'Bahasa' LIMIT 1);
INSERT INTO course_categories (id, name, created_at, updated_at)
SELECT UUID(), 'Bahasa', NOW(), NOW()
WHERE @bahasa_id IS NULL;
SET @bahasa_id = (SELECT id FROM course_categories WHERE name = 'Bahasa' LIMIT 1);


-- Seed Sub-Course Categories for 'Akademik'
INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Matematika', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Matematika' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Fisika', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Fisika' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Kimia', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Kimia' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Biologi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Biologi' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Bahasa Inggris', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Bahasa Inggris' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Bahasa Indonesia', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Bahasa Indonesia' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Sejarah', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Sejarah' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Geografi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Geografi' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Sosiologi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Sosiologi' AND course_category_id = @akademik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @akademik_id, 'Ekonomi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Ekonomi' AND course_category_id = @akademik_id);


-- Seed Sub-Course Categories for 'Musik'
INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @musik_id, 'Gitar', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Gitar' AND course_category_id = @musik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @musik_id, 'Piano', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Piano' AND course_category_id = @musik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @musik_id, 'Vokal', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Vokal' AND course_category_id = @musik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @musik_id, 'Drum', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Drum' AND course_category_id = @musik_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @musik_id, 'Violin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Violin' AND course_category_id = @musik_id);


-- Seed Sub-Course Categories for 'Olahraga'
INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @olahraga_id, 'Renang', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Renang' AND course_category_id = @olahraga_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @olahraga_id, 'Basket', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Basket' AND course_category_id = @olahraga_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @olahraga_id, 'Sepak Bola', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Sepak Bola' AND course_category_id = @olahraga_id);


-- Seed Sub-Course Categories for 'Bahasa'
INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @bahasa_id, 'Inggris', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Inggris' AND course_category_id = @bahasa_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @bahasa_id, 'Mandarin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Mandarin' AND course_category_id = @bahasa_id);

INSERT INTO sub_course_categories (id, course_category_id, name, created_at, updated_at)
SELECT UUID(), @bahasa_id, 'Jepang', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM sub_course_categories WHERE name = 'Jepang' AND course_category_id = @bahasa_id);


-- Seed Lookups for Tutor Document Types
INSERT INTO lookups (id, type, code, description, created_at, updated_at)
SELECT UUID(), 'document_type', 'KTP', 'Kartu Tanda Penduduk', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM lookups WHERE type = 'document_type' AND code = 'KTP');

INSERT INTO lookups (id, type, code, description, created_at, updated_at)
SELECT UUID(), 'document_type', 'IJAZAH', 'Ijazah Terakhir', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM lookups WHERE type = 'document_type' AND code = 'IJAZAH');

INSERT INTO lookups (id, type, code, description, created_at, updated_at)
SELECT UUID(), 'document_type', 'SERTIFIKAT', 'Sertifikat Keahlian', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM lookups WHERE type = 'document_type' AND code = 'SERTIFIKAT');

INSERT INTO lookups (id, type, code, description, created_at, updated_at)
SELECT UUID(), 'document_type', 'CV', 'Curriculum Vitae', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM lookups WHERE type = 'document_type' AND code = 'CV');
