CREATE TABLE tutor_documents (
    id char(36) PRIMARY KEY,
    tutor_id char(36) NOT NULL,
    url text NOT NULL,
    status varchar(255) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp NULL DEFAULT NULL,
    created_by char(36) NOT NULL,
    updated_by char(36) NOT NULL,
    deleted_by char(36) NULL DEFAULT NULL,
    FOREIGN KEY (tutor_id) REFERENCES tutors (id)
);
