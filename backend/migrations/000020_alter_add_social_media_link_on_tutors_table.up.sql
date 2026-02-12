alter table tutors add column linkedin_link varchar(255) null after online_channel;
alter table tutors add column tiktok_link varchar(255) null after linkedin_link;
alter table tutors add column instagram_link varchar(255) null after tiktok_link;
