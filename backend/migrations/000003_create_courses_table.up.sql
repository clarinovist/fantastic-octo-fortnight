create table courses (
    id char(36) not null primary key,
    course_category_id char(36) not null,
    tutor_id char(36) not null,
    description text not null,
    rate decimal(15, 2) not null default 0,
    is_free_first_course bool not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    created_by char(36) null,
    updated_by char(36) null,
    deleted_by char(36) null,
    foreign key (course_category_id) references course_categories (id),
    foreign key (tutor_id) references tutors (id)
);