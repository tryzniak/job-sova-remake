create table users (
  id bigint not null auto_increment primary key,
  username varchar(256) not null unique,
  profilePicId varchar(256) unique,
  email varchar(256) not null unique,
  newEmail varchar(256) unique,
  emailChangeToken varchar(256) unique ,
  emailChangeRequestedAt datetime ,
  phone varchar(20) not null unique,
  roleId bigint not null,
  confirmed boolean not null default FALSE,
  passwordResetToken varchar(256) unique,
  passwordResetRequestedAt datetime DEFAULT NULL,
  foreign key(roleId) references roles(id)
);

create table jobSeekers (
  userId bigint not null primary key,
  firstName varchar(255) not null,
  lastName varchar(255) not null,
  patronymicName varchar(255) not null,
  gender varchar(1),
  dateOfBirth date not null,
  foreign key(userId) references users(id) on delete cascade
);

create table employers (
  userId bigint not null primary key,
  title varchar(255) not null unique,
  about text(600) not null,
  residence varchar(255) not null,
  foreign key(userId) references users(id) on delete cascade
);

create table admins (
  userId bigint not null primary key,
  foreign key(userId) references users(id) on delete cascade
);

create table disabilities (
  id bigint not null primary key,
  title varchar(255) not null unique
);

create table disabilityTypes (
  id bigint not null primary key auto_increment,
  title varchar(255) not null unique
);

create table disabilityGroups (
  id bigint not null primary key auto_increment,
  title varchar(255) not null unique
);



create table educations (
  id bigint not null primary key,
  title varchar(255) not null unique
);

create table occupations (
  id bigint not null primary key,
  title varchar(255) not null unique
);

create table roles (
  id bigint not null auto_increment primary key,
  title varchar(255) not null unique
);

create table applications (
  id bigint not null auto_increment primary key,
  resumeId bigint not null,
  foreign key(resumeId) references resumes(id) on delete cascade,
  vacancyId bigint not null,
  foreign key(vacancyId) references vacancies(id) on delete cascade,
  message text(600),
  UNIQUE KEY `applicationsUniqueIndex` (`resumeId`,`vacancyId`)
);

create table markers (
  id bigint not null auto_increment primary key,
  address varchar(256) not null,
  lat float(10, 6) not null,
  lng float(10, 6) not null
);

create table vacancies (
  id bigint not null auto_increment primary key,
  employerId bigint not null,
  foreign key(employerId) references employers(userId) on delete cascade,
  disabilityTypeId bigint not null,
  foreign key(disabilityTypeId) references disabilityTypes(id) on delete cascade,
  disabilityGroupId bigint not null,
  foreign key(disabilityGroupId) references disabilityGroup(id) on delete cascade,
  educationId bigint not null,
  foreign key(educationId) references educations(id),
  title varchar(256) not null unique,
  contacts text(600) not null,
  responsibilities text(600) not null,
  partTime boolean not null default FALSE,
  about text(600) not null,
  isActive boolean not null default TRUE,
  isAccessible boolean not null default TRUE,
  isRemoteOk boolean not null default TRUE,
  hasTrainingOrCourse boolean not null default FALSE,
  experienceIsRequired boolean not null default FALSE,
  markerId bigint not null,
  foreign key(markerId) references markers(id) on delete cascade,
  salaryBYR bigint,
  modederationStatus varchar(12) not null default "NEEDS_REVIEW",
  createdAt timestamp default NOW(),
  updatedAt timestamp on default NOW() update NOW()
);

create table vacancySkills (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `skillId` bigint(20) NOT NULL,
  `vacancyId` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vacancySkillIndex` (`skillId`,`vacancyId`),
  KEY `vacancyId` (`vacancyId`),
  CONSTRAINT `vacancieSkills_ibfk_1` FOREIGN KEY (`vacancyId`) REFERENCES `vacancies` (`id`),
  CONSTRAINT `vacancieSkills_ibfk_2` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`)
);

create table professions (
  id bigint not null primary key auto_increment,
  title varchar(255) not null unique
);

create table resumes (
  id bigint not null primary key auto_increment,
  title varchar(255) not null unique,
  jobSeekerId bigint not null ,
  foreign key(jobSeekerId) references jobSeekers(userId) on delete cascade, 
  about text(600) not null,
  hasExperience boolean not null,
  isRemoteOnly boolean not null,
  residence varchar(256) not null,
  contacts text(600) not null,
  disabilityId bigint not null,
  foreign key(disabilityId) references disabilities(id), 
  needsAccessibility boolean not null default TRUE,
  isActive boolean not null default TRUE,
  modederationStatus varchar(12) not null default "NEEDS_REVIEW",
  createdAt timestamp default NOW(),
  updatedAt timestamp on default NOW() update NOW()
);

create table resumeExperiences (
  id bigint not null primary key auto_increment,
  resumeId bigint not null,
  foreign key(resumeId) references resumes(id) on delete cascade,
  position varchar(256) not null,
  employerTitle varchar(256) not null,
  startingOn date not null,
  endingOn date
);


create table resumeProfessions (
  id bigint not null primary key auto_increment,
  resumeId bigint not null,
  foreign key(resumeId) references resumes(id) on delete cascade,
  professionId bigint not null,
  foreign key(professionId) references professions(id) on delete cascade,
  unique key uniqueResumeProfession (resumeId, professionId)
);

create table resumeEducations (
  id bigint not null primary key auto_increment,
  resumeId bigint not null,
  foreign key(resumeId) references resumes(id) on delete cascade,
  educationId bigint not null,
  foreign key(educationId) references educations(id) on delete cascade,
  unique key uniqueResumeEducation (resumeId, specialty, institutionTitle, educationId),
  specialty varchar(256) not null,
  institutionTitle varchar(256) not null,
  endingOn date not null
);

create table skills (
  id bigint(20) NOT NULL primary auto_increment,
  title varchar(255) NULL,
  UNIQUE KEY `title` (`title`)
);

create table resumeSkills (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `skillId` bigint(20) NOT NULL,
  `resumeId` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `resumeSkillIndex` (`skillId`,`resumeId`),
  KEY `resumeId` (`resumeId`),
  CONSTRAINT `resumeSkills_ibfk_1` FOREIGN KEY (`resumeId`) REFERENCES `resumes` (`id`),
  CONSTRAINT `resumeSkills_ibfk_2` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`)
);

