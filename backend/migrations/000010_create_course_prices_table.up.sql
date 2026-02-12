create table course_prices (
    id char(36) not null primary key,
    course_id char(36) not null,
    class_type enum('offline', 'online') not null,
    duration_in_hour int not null,
    price decimal(15, 2) not null,
    created_at timestamp not null default current_timestamp,
    created_by char(36) null,
    constraint fk_course_prices_course_id foreign key (course_id) references courses (id) on delete no action
);
