create table tutors (
    id char(36) not null primary key ,
    name varchar(255) not null,
    photo_profile varchar(255) null,
    class_type enum ('all', 'offline', 'online') not null default 'all',
    latitude decimal(8, 6) null,
    longitude decimal(9, 6) null,
    level varchar(255) null,
    level_of_education varchar(255) null,
    rating decimal(4, 2) not null default 0,
    total_rating int unsigned not null default 0,
    response_time int null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null,
    created_by char(36) null,
    updated_by char(36) null,
    deleted_by char(36) null
);