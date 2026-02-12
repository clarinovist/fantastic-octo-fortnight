create table if not exists roles
(
    id         char(36) primary key,
    name       VARCHAR(50) unique not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    deleted_at timestamp          null
);

insert into roles (id, name)
values ('2978e01c-b12f-4143-945e-5d05c33d1246', 'admin'),
       ('2090d47f-0616-4dcb-bfcf-4429d3893f16', 'tutor'),
       ('d7a5d020-558c-42d5-832e-ee21420611d8', 'student');