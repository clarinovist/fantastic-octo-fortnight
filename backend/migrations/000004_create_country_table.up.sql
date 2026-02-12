create table countries
(
    id   CHAR(36) primary key,
    iso2 CHAR(2) unique not null,
    iso3 CHAR(3) unique not null,
    name VARCHAR(100)   not null
);

insert into countries (id, iso2, iso3, name)
    value ('fbc0c209-b6c9-44bc-9768-e3c4a833e011', 'ID', 'IDN', 'Indonesia');
