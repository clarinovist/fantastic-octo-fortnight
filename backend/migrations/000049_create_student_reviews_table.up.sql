create table student_reviews (
    id char(36) primary key,
    booking_id char(36) not null,
    course_id char(36) not null,
    tutor_id char(36) not null,
    student_id char(36) not null,
    review text null,
    rate int null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    created_by char(36) null,
    updated_by char(36) null,
    deleted_by char(36) null,

    foreign key (booking_id) references bookings(id),
    foreign key (course_id) references courses(id),
    foreign key (tutor_id) references tutors(id),
    foreign key (student_id) references students(id)
);
