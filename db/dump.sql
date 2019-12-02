-- MySQL dump 10.13  Distrib 5.7.26, for Linux (x86_64)
--
-- Host: localhost    Database: jobsova
-- ------------------------------------------------------
-- Server version	5.7.26

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `applications` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `resumeId` bigint(20) DEFAULT NULL,
  `vacancyId` bigint(20) NOT NULL,
  `jobSeekerId` bigint(20) NOT NULL,
  `employerId` bigint(20) NOT NULL,
  `jobSeekerContacts` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applicationsUniqueIndex` (`jobSeekerId`,`vacancyId`),
  KEY `resumeId` (`resumeId`),
  KEY `vacancyId` (`vacancyId`),
  KEY `employerId` (`employerId`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`resumeId`) REFERENCES `resumes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`vacancyId`) REFERENCES `vacancies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`jobSeekerId`) REFERENCES `jobSeekers` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_4` FOREIGN KEY (`employerId`) REFERENCES `employers` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `callbacks`
--

DROP TABLE IF EXISTS `callbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `callbacks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `message` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jobSeekerId` bigint(20) NOT NULL,
  `partnerId` bigint(20) NOT NULL,
  `phone` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moderationStatus` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEEDS_REVIEW',
  PRIMARY KEY (`id`),
  UNIQUE KEY `message` (`message`),
  UNIQUE KEY `jobSeekerTopicUniqueIndex` (`jobSeekerId`,`partnerId`,`message`),
  KEY `partnerId` (`partnerId`),
  CONSTRAINT `callbacks_ibfk_1` FOREIGN KEY (`jobSeekerId`) REFERENCES `jobSeekers` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `callbacks_ibfk_2` FOREIGN KEY (`partnerId`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chatMessages`
--

DROP TABLE IF EXISTS `chatMessages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatMessages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `applicationId` bigint(20) NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `fromUserId` bigint(20) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `applicationId` (`applicationId`),
  KEY `fromUserId` (`fromUserId`),
  CONSTRAINT `chatMessages_ibfk_1` FOREIGN KEY (`applicationId`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chatMessages_ibfk_2` FOREIGN KEY (`fromUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `citizenships`
--

DROP TABLE IF EXISTS `citizenships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `citizenships` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `disabilityGroups`
--

DROP TABLE IF EXISTS `disabilityGroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disabilityGroups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `disabilityTypes`
--

DROP TABLE IF EXISTS `disabilityTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disabilityTypes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `educations`
--

DROP TABLE IF EXISTS `educations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `educations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employers`
--

DROP TABLE IF EXISTS `employers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employers` (
  `userId` bigint(20) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `about` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `residence` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `title` (`title`),
  CONSTRAINT `employers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobSeekers`
--

DROP TABLE IF EXISTS `jobSeekers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobSeekers` (
  `userId` bigint(20) NOT NULL,
  `firstName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patronymicName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateOfBirth` date NOT NULL,
  `contacts` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `jobSeekers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `markers`
--

DROP TABLE IF EXISTS `markers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `markers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `address` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` float(10,6) NOT NULL,
  `lng` float(10,6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `occupations`
--

DROP TABLE IF EXISTS `occupations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `occupations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `about` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `message` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jobSeekerId` bigint(20) NOT NULL,
  `partnerId` bigint(20) NOT NULL,
  `email` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moderationStatus` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEEDS_REVIEW',
  PRIMARY KEY (`id`),
  UNIQUE KEY `message` (`message`),
  UNIQUE KEY `jobSeekerTopicUniqueIndex` (`jobSeekerId`,`partnerId`,`message`),
  KEY `partnerId` (`partnerId`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`jobSeekerId`) REFERENCES `jobSeekers` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`partnerId`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resumeEducations`
--

DROP TABLE IF EXISTS `resumeEducations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resumeEducations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `resumeId` bigint(20) NOT NULL,
  `educationId` bigint(20) NOT NULL,
  `specialty` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institutionTitle` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endingOn` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniqueResumeEducation` (`resumeId`,`specialty`,`institutionTitle`,`educationId`),
  KEY `educationId` (`educationId`),
  CONSTRAINT `resumeEducations_ibfk_1` FOREIGN KEY (`resumeId`) REFERENCES `resumes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resumeEducations_ibfk_2` FOREIGN KEY (`educationId`) REFERENCES `educations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resumeExperiences`
--

DROP TABLE IF EXISTS `resumeExperiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resumeExperiences` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `resumeId` bigint(20) NOT NULL,
  `positionTitle` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startingOn` date NOT NULL,
  `endingOn` date NOT NULL,
  `employerTitle` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resumeId` (`resumeId`),
  CONSTRAINT `resumeExperiences_ibfk_1` FOREIGN KEY (`resumeId`) REFERENCES `resumes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resumeSkills`
--

DROP TABLE IF EXISTS `resumeSkills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resumeSkills` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `skillId` bigint(20) NOT NULL,
  `resumeId` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `resumeSkillIndex` (`skillId`,`resumeId`),
  KEY `resumeId` (`resumeId`),
  CONSTRAINT `resumeSkills_ibfk_1` FOREIGN KEY (`resumeId`) REFERENCES `resumes` (`id`),
  CONSTRAINT `resumeSkills_ibfk_2` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resumes`
--

DROP TABLE IF EXISTS `resumes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resumes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobSeekerId` bigint(20) NOT NULL,
  `about` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRemoteOnly` tinyint(1) NOT NULL,
  `residence` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `needsAccessibility` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `disabilityTypeId` bigint(20) NOT NULL,
  `disabilityGroupId` bigint(20) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `moderationStatus` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEEDS_REVIEW',
  `citizenshipId` bigint(20) NOT NULL,
  `communicationMeans` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email',
  `phone` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patronymicName` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dateOfBirth` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  KEY `jobSeekerId` (`jobSeekerId`),
  KEY `disabilityTypeId` (`disabilityTypeId`),
  KEY `disabilityGroupId` (`disabilityGroupId`),
  KEY `citizenshipFK` (`citizenshipId`),
  CONSTRAINT `citizenshipFK` FOREIGN KEY (`citizenshipId`) REFERENCES `citizenships` (`id`),
  CONSTRAINT `resumes_ibfk_1` FOREIGN KEY (`jobSeekerId`) REFERENCES `jobSeekers` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `resumes_ibfk_3` FOREIGN KEY (`disabilityTypeId`) REFERENCES `disabilityTypes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resumes_ibfk_4` FOREIGN KEY (`disabilityGroupId`) REFERENCES `disabilityGroups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `skills` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `confirmedEmail` tinyint(1) NOT NULL DEFAULT '0',
  `passwordResetToken` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passwordResetRequestedAt` datetime DEFAULT NULL,
  `newEmail` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailChangeToken` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailChangeRequestedAt` datetime DEFAULT NULL,
  `profilePicId` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `liveUpdatesToken` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `uniqueLiveUpdatesToken` (`liveUpdatesToken`),
  UNIQUE KEY `emailChangeToken` (`emailChangeToken`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vacancies`
--

DROP TABLE IF EXISTS `vacancies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vacancies` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `employerId` bigint(20) NOT NULL,
  `educationId` bigint(20) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `about` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `isAccessible` tinyint(1) NOT NULL DEFAULT '1',
  `isRemoteOk` tinyint(1) NOT NULL DEFAULT '1',
  `markerId` bigint(20) NOT NULL,
  `moderationStatus` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEEDS_REVIEW',
  `hasTrainingOrCourse` tinyint(1) NOT NULL DEFAULT '0',
  `experienceIsRequired` tinyint(1) NOT NULL DEFAULT '0',
  `salaryBYR` bigint(20) DEFAULT NULL,
  `partTime` tinyint(1) NOT NULL DEFAULT '0',
  `responsibilities` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `contacts` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `disabilityGroupId` bigint(20) DEFAULT NULL,
  `disabilityTypeId` bigint(20) DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  KEY `employerId` (`employerId`),
  KEY `educationId` (`educationId`),
  KEY `markerId` (`markerId`),
  KEY `disabilityGroupId` (`disabilityGroupId`),
  KEY `disabilityTypeId` (`disabilityTypeId`),
  CONSTRAINT `vacancies_ibfk_1` FOREIGN KEY (`employerId`) REFERENCES `employers` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `vacancies_ibfk_3` FOREIGN KEY (`educationId`) REFERENCES `educations` (`id`),
  CONSTRAINT `vacancies_ibfk_4` FOREIGN KEY (`markerId`) REFERENCES `markers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vacancies_ibfk_5` FOREIGN KEY (`disabilityGroupId`) REFERENCES `disabilityGroups` (`id`),
  CONSTRAINT `vacancies_ibfk_6` FOREIGN KEY (`disabilityTypeId`) REFERENCES `disabilityTypes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vacancySkills`
--

DROP TABLE IF EXISTS `vacancySkills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vacancySkills` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `skillId` bigint(20) NOT NULL,
  `vacancyId` bigint(20) NOT NULL,
  `moderationStatus` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEEDS_REVIEW',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vacancySkillIndex` (`skillId`,`vacancyId`),
  KEY `vacancyId` (`vacancyId`),
  CONSTRAINT `vacancieSkills_ibfk_1` FOREIGN KEY (`vacancyId`) REFERENCES `vacancies` (`id`),
  CONSTRAINT `vacancieSkills_ibfk_2` FOREIGN KEY (`skillId`) REFERENCES `skills` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-12-02 19:52:31
