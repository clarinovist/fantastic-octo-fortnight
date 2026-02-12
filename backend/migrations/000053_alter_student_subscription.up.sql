alter table students add column customer_id varchar(100) null after user_id;

alter table students add column premium_until timestamp null after customer_id;
