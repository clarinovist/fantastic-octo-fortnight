create table course_schedules (
    id char(36) not null primary key ,
    course_id char(36) not null,
    day int not null,
    start_time time not null,
    timezone varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    created_by char(36) null,
    updated_by char(36) null,
    deleted_by char(36) null,
    constraint fk_tutor_schedules_tutor foreign key (course_id) references courses (id)
);