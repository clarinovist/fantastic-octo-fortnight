create table if not exists user_roles
(
    user_id char(36),
    role_id char(36),
    foreign key (user_id) references users (id),
    foreign key (role_id) references roles (id),
    primary key (user_id, role_id)
);