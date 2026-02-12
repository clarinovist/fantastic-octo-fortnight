create table subscription_prices
(
    id         char(36) primary key,
    name       varchar(255)   not null,
    `interval` varchar(255)   not null,
    price      decimal(10, 2) not null,
    created_at timestamp      not null default current_timestamp,
    updated_at timestamp      not null default current_timestamp on update current_timestamp
);

insert into subscription_prices (id, name, `interval`, price, created_at, updated_at)
values ('30e88d1b-2ed9-4ec3-81a3-f55e8b1df669', 'Les Private Monthly', 'monthly', 50000, now(), now()),
       ('95698aaf-2bd6-4f4f-abb2-a360d735718d', 'Les Private Yearly', 'yearly', 500000, now(), now());