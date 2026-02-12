CREATE TABLE course_sub_course_categories (
    id CHAR(36) NOT NULL PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    sub_course_category_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36) NULL,
    updated_by CHAR(36) NULL,
    deleted_by CHAR(36) NULL,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (sub_course_category_id) REFERENCES sub_course_categories (id) ON DELETE CASCADE,
    INDEX idx_course_sub_course_categories_course_id (course_id),
    INDEX idx_course_sub_course_categories_sub_course_category_id (sub_course_category_id),
    INDEX idx_course_sub_course_categories_deleted_at (deleted_at)
);
