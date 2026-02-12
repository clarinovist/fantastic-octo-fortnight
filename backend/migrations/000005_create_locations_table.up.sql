create table locations
(
    id         CHAR(36) primary key,
    country_id CHAR(36)     not null,
    parent_id  CHAR(36)     null,
    name       VARCHAR(150) not null,
    type       VARCHAR(50)  not null,
    full_name  TEXT,
    created_at timestamp    not null default current_timestamp,
    foreign key (country_id) references countries (id),
    foreign key (parent_id) references locations (id)
);

create index idx_locations_full_name on locations (full_name(255));

