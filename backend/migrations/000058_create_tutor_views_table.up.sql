create table course_views (
    id char(36) primary key,
    tutor_id char(36) not null,
    user_id char(36) null,
    course_id char(36) not null,
    course_category_id char(36) not null,
    ip_address varchar(45) null,
    user_agent text null,
    created_at timestamp not null default current_timestamp,
    index idx_course_views_tutor_id (tutor_id),
    index idx_course_views_user_id (user_id),
    index idx_course_views_course_id (course_id),
    index idx_course_views_course_category_id (course_category_id),
    index idx_course_views_created_at (created_at),
    constraint fk_course_views_tutor foreign key (tutor_id) references tutors(id),
    constraint fk_course_views_course foreign key (course_id) references courses(id),
    constraint fk_course_views_course_category foreign key (course_category_id) references course_categories(id)
);
