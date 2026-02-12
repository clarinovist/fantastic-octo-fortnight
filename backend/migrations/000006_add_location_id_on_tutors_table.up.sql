alter table tutors
    add column location_id char(36) null;

alter table tutors
    add constraint fk_tutors_location_id foreign key (location_id) references locations (id) on delete no action;
