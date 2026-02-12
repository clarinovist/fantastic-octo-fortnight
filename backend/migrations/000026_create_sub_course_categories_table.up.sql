CREATE TABLE sub_course_categories (
    id CHAR(36) PRIMARY KEY,
    course_category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    deleted_by CHAR(36) NULL,
    FOREIGN KEY (course_category_id) REFERENCES course_categories(id) ON DELETE CASCADE,
    INDEX idx_sub_course_categories_course_category_id (course_category_id),
    INDEX idx_sub_course_categories_name (name),
    INDEX idx_sub_course_categories_deleted_at (deleted_at)
);
