create table lookups
(
    id          char(36)     not null primary key,
    type        varchar(255) not null,
    code        varchar(255) not null,
    description varchar(255) not null,
    created_at  timestamp    not null default current_timestamp,
    updated_at  timestamp    not null default current_timestamp on update current_timestamp,
    deleted_at  timestamp    null     default null,
    key type (type, code)
);

insert into lookups (id, type, code, description)
values (uuid(), 'class_type', 'online', 'Online'),
       (uuid(), 'class_type', 'offline', 'Offline'),
       (uuid(), 'class_type', 'all', 'All');

insert into lookups (id, type, code, description)
values (uuid(), 'level_of_education_course', 'SD', 'SD'),
       (uuid(), 'level_of_education_course', 'SMP', 'SMP'),
       (uuid(), 'level_of_education_course', 'SMA', 'SMA'),
       (uuid(), 'level_of_education_course', 'SMK', 'SMK'),
       (uuid(), 'level_of_education_course', 'Perguruan Tinggi', 'Perguruan Tinggi'),
       (uuid(), 'level_of_education_course', 'Umum', 'Umum');
