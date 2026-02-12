create table tutor_ratings (
    id char(36) not null primary key,
    student_id char(36) not null,
    tutor_id char(36) not null,
    rating decimal(4, 2) not null default 0,
    review text not null,
    created_at timestamp not null default current_timestamp,
    created_by char(36) null,
    constraint fk_tutor_ratings_tutor_id foreign key (tutor_id) references tutors (id) on delete no action,
    constraint fk_tutor_ratings_student_id foreign key (student_id) references students (id) on delete no action
);