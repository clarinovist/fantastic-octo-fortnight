create table student_courses (
    id char(36) not null primary key ,
    student_id char(36) not null,
    course_id char(36) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    created_by char(36) null,
    updated_by char(36) null,
    deleted_by char(36) null,
    constraint fk_student_courses_student foreign key (student_id) references students(id),
    constraint fk_student_courses_course foreign key (course_id) references courses(id)
)