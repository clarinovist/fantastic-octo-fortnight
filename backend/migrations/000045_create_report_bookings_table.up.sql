create table report_bookings
(
    id char(36) primary key,
    student_id char(36) not null references students (id),
    booking_id char(36) not null references bookings (id),
    topic varchar(255) not null,
    body text not null,
    status varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    created_by char(36) not null,
    updated_by char(36) not null,
    deleted_by char(36) null,
    index (student_id),
    index (booking_id)
);
