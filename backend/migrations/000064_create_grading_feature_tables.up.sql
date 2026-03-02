CREATE TABLE session_tasks (
    id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    attachment_url VARCHAR(255),
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE task_submissions (
    id CHAR(36) PRIMARY KEY,
    session_task_id CHAR(36) NOT NULL,
    submission_url VARCHAR(255),
    score DECIMAL(5,2),
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (session_task_id) REFERENCES session_tasks(id) ON DELETE CASCADE
);

ALTER TABLE report_bookings ADD COLUMN progress_notes TEXT;
