create table level_education_courses (
    course_id char(36) not null,
    level_of_education varchar(255) not null,
    primary key (course_id, level_of_education)
);