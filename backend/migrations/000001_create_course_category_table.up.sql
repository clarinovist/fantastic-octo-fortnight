create table course_categories
(
    id char(36) not null primary key,
    name varchar(255),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    created_by char(36) null,
    updated_by char(36) null,
    deleted_by char(36) null
);