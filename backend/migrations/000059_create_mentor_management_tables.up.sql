CREATE TABLE mentor_students (
    id          CHAR(36) PRIMARY KEY,
    tutor_id    CHAR(36) NOT NULL,
    student_id  CHAR(36) NOT NULL,
    joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status      ENUM('active', 'inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_mentor_students_tutor (tutor_id),
    INDEX idx_mentor_students_student (student_id),
    UNIQUE KEY uniq_mentor_student (tutor_id, student_id),
    CONSTRAINT fk_mentor_students_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor_students_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE mentor_balances (
    id          CHAR(36) PRIMARY KEY,
    tutor_id    CHAR(36) NOT NULL,
    balance     DECIMAL(15,2) DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_mentor_balance_tutor (tutor_id),
    CONSTRAINT fk_mentor_balances_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);

CREATE TABLE balance_transactions (
    id              CHAR(36) PRIMARY KEY,
    tutor_id        CHAR(36) NOT NULL,
    type            ENUM('credit', 'debit') NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    commission      DECIMAL(15,2) DEFAULT 0,
    reference_type  VARCHAR(50), 
    reference_id    CHAR(36),
    description     VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_balance_transactions_tutor (tutor_id),
    CONSTRAINT fk_balance_transactions_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);

CREATE TABLE withdrawal_requests (
    id              CHAR(36) PRIMARY KEY,
    tutor_id        CHAR(36) NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    bank_name       VARCHAR(100),
    account_number  VARCHAR(50),
    account_name    VARCHAR(100),
    status          ENUM('pending', 'processing', 'completed', 'rejected') DEFAULT 'pending',
    admin_note      VARCHAR(500),
    processed_at    TIMESTAMP NULL,
    processed_by    CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_withdrawal_requests_tutor (tutor_id),
    CONSTRAINT fk_withdrawal_requests_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    CONSTRAINT fk_withdrawal_requests_admin FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE mentor_invite_codes (
    id          CHAR(36) PRIMARY KEY,
    tutor_id    CHAR(36) NOT NULL,
    code        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_mentor_invite_code (code),
    UNIQUE KEY uniq_mentor_invite_tutor (tutor_id),
    CONSTRAINT fk_mentor_invite_codes_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);
