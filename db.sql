-- MySQL dump 10.13  Distrib 5.7.24, for osx11.1 (x86_64)
--
-- Host: localhost    Database: rsa_scheduler
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `calendar`
--

DROP TABLE IF EXISTS `calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calendar` (
  `idcalendar` int NOT NULL AUTO_INCREMENT,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  `event_title` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`idcalendar`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar`
--

LOCK TABLES `calendar` WRITE;
/*!40000 ALTER TABLE `calendar` DISABLE KEYS */;
INSERT INTO `calendar` VALUES (58,'2025-07-18 01:30:00','2025-07-18 05:30:00',1,'1',2,NULL),(59,'2025-07-16 10:00:00','2025-07-16 11:00:00',2,'2',4,NULL),(61,'2025-07-16 01:00:00','2025-07-16 06:30:00',3,'3',2,NULL),(64,'2025-07-14 01:30:00','2025-07-14 05:00:00',6,'6',4,NULL),(65,'2025-07-25 09:15:00','2025-07-25 11:45:00',9,'Muhammad Hussein',NULL,NULL),(66,'2025-07-29 00:30:00','2025-07-29 05:30:00',1,'Science',NULL,NULL),(70,'2025-08-01 08:11:00','2025-08-02 09:12:00',NULL,'IEEEEe',2,'NMAMAMMAMAMMAMMAMAMA'),(86,'2025-08-26 22:09:00','2025-08-26 23:09:00',NULL,'DEIJDIEgeuyikusjlkaf',5,'description');
/*!40000 ALTER TABLE `calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `grade_level` varchar(45) DEFAULT NULL,
  `teacher_id` int NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `recurring_days` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_class_user_idx` (`teacher_id`),
  CONSTRAINT `fk_class_user` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES (11,'Math','10',4,'2025-07-31 20:30:00','2025-08-01 23:45:00','Wed,Thu'),(12,'Physics','11',2,'2025-07-27 14:00:00','2026-01-01 20:00:00','Tue,Fri'),(18,'ENG 101','12',2,'2025-08-10 13:30:00','2025-10-10 15:00:00','Tue,Thu');
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_class`
--
DELETE FROM `rsa_scheduler`.`user` WHERE (`id` = '7');

DROP TABLE IF EXISTS `student_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_class` (
  `user_id` int NOT NULL,
  `class_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`class_id`),
  KEY `fk_class` (`class_id`),
  CONSTRAINT `fk_student_class_class_id` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student_class_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_class`
--

LOCK TABLES `student_class` WRITE;
/*!40000 ALTER TABLE `student_class` DISABLE KEYS */;
INSERT INTO `student_class` VALUES (3,11),(5,11),(3,12),(5,12);
/*!40000 ALTER TABLE `student_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `address` varchar(45) NOT NULL,
  `role` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `grade_level` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS teacher_availability;
CREATE TABLE teacher_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    valid_from DATE DEFAULT NULL, -- optional: when this slot starts being valid
    valid_to DATE DEFAULT NULL,   -- optional: when this slot ends being valid
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Example: Insert data into teacher_availability table
INSERT INTO teacher_availability
  (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to, created_at)
VALUES
  (2, 1, '08:00:00', '12:00:00', '2024-06-01', '2024-12-31', NOW()),
  (2, 3, '09:30:00', '15:00:00', '2024-06-01', '2024-12-31', NOW()),
  (2, 5, '07:45:00', '11:30:00', '2024-06-01', '2024-12-31', NOW());

--
-- Dumping data for table `user`
--
-- seed_teachers.sql
-- Day-of-week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

-- Optional if your session needs it:
-- USE rsa_scheduler;

START TRANSACTION;

SET @valid_from = '2025-09-01';
SET @valid_to   = '2025-12-31';

-- 1) Insert teachers if they don't already exist (by email)
INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Emma', 'Hall', 'emma.hall@rsa.edu', '123 Oak St', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='emma.hall@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Liam', 'Patel', 'liam.patel@rsa.edu', '34 Pine Ave', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='liam.patel@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Wei', 'Li', 'wei.li@rsa.edu', '56 Maple Rd', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='wei.li@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Maria', 'Garcia', 'maria.garcia@rsa.edu', '78 Cedar St', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='maria.garcia@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'James', 'Smith', 'james.smith@rsa.edu', '90 Birch Blvd', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='james.smith@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Fatima', 'Khan', 'fatima.khan@rsa.edu', '12 Cherry Ln', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='fatima.khan@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Diego', 'Fernandez', 'diego.fernandez@rsa.edu', '23 Willow Way', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='diego.fernandez@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Sara', 'Ali', 'sara.ali@rsa.edu', '45 Spruce Ct', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='sara.ali@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Andrew', 'Choi', 'andrew.choi@rsa.edu', '67 Elm Sq', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='andrew.choi@rsa.edu');

INSERT INTO `user` (first_name, last_name, email, address, role, password, status, grade_level)
SELECT 'Nina', 'Ivanov', 'nina.ivanov@rsa.edu', '89 Poplar Dr', 'teacher', 'changeme', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email='nina.ivanov@rsa.edu');

-- 2) Availability inserts (idempotent)
-- Helper macro: insert only if an exact row doesn't already exist
-- (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)

-- Emma Hall (Mon 08-11, Wed 13-16)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 1, '08:00:00', '11:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='emma.hall@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=1
    AND ta.start_time='08:00:00' AND ta.end_time='11:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 3, '13:00:00', '16:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='emma.hall@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=3
    AND ta.start_time='13:00:00' AND ta.end_time='16:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Liam Patel (Tue 09-12, Thu 14-17)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 2, '09:00:00', '12:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='liam.patel@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=2
    AND ta.start_time='09:00:00' AND ta.end_time='12:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 4, '14:00:00', '17:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='liam.patel@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=4
    AND ta.start_time='14:00:00' AND ta.end_time='17:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Wei Li (Mon 10-12:30, Fri 09-11)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 1, '10:00:00', '12:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='wei.li@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=1
    AND ta.start_time='10:00:00' AND ta.end_time='12:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 5, '09:00:00', '11:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='wei.li@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=5
    AND ta.start_time='09:00:00' AND ta.end_time='11:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Maria Garcia (Tue 08:30-11:30, Thu 09-12)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 2, '08:30:00', '11:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='maria.garcia@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=2
    AND ta.start_time='08:30:00' AND ta.end_time='11:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 4, '09:00:00', '12:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='maria.garcia@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=4
    AND ta.start_time='09:00:00' AND ta.end_time='12:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- James Smith (Wed 08-12, Fri 13-16)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 3, '08:00:00', '12:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='james.smith@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=3
    AND ta.start_time='08:00:00' AND ta.end_time='12:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 5, '13:00:00', '16:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='james.smith@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=5
    AND ta.start_time='13:00:00' AND ta.end_time='16:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Fatima Khan (Mon 07:45-11:45, Thu 12:30-15:30)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 1, '07:45:00', '11:45:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='fatima.khan@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=1
    AND ta.start_time='07:45:00' AND ta.end_time='11:45:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 4, '12:30:00', '15:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='fatima.khan@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=4
    AND ta.start_time='12:30:00' AND ta.end_time='15:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Diego Fernandez (Tue 10-13, Fri 08-10:30)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 2, '10:00:00', '13:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='diego.fernandez@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=2
    AND ta.start_time='10:00:00' AND ta.end_time='13:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 5, '08:00:00', '10:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='diego.fernandez@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=5
    AND ta.start_time='08:00:00' AND ta.end_time='10:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Sara Ali (Wed 09:30-12:30, Fri 10-13)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 3, '09:30:00', '12:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='sara.ali@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=3
    AND ta.start_time='09:30:00' AND ta.end_time='12:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 5, '10:00:00', '13:00:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='sara.ali@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=5
    AND ta.start_time='10:00:00' AND ta.end_time='13:00:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Andrew Choi (Mon 08:30-11:30, Thu 14:30-17:30)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 1, '08:30:00', '11:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='andrew.choi@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=1
    AND ta.start_time='08:30:00' AND ta.end_time='11:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 4, '14:30:00', '17:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='andrew.choi@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=4
    AND ta.start_time='14:30:00' AND ta.end_time='17:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

-- Nina Ivanov (Tue 11-13:30, Thu 09:30-12:30)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 2, '11:00:00', '13:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='nina.ivanov@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=2
    AND ta.start_time='11:00:00' AND ta.end_time='13:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to)
SELECT u.id, 4, '09:30:00', '12:30:00', @valid_from, @valid_to
FROM `user` u
WHERE u.email='nina.ivanov@rsa.edu'
AND NOT EXISTS (
  SELECT 1 FROM teacher_availability ta
  WHERE ta.teacher_id=u.id AND ta.day_of_week=4
    AND ta.start_time='09:30:00' AND ta.end_time='12:30:00'
    AND ta.valid_from=@valid_from AND ta.valid_to=@valid_to
);

COMMIT;

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'bob','adam','bob.adam@gmail.com','100 mian street','admin','test',1,NULL),(2,'ali','ahmed','ali.ahmed@gmail.com','test street','teacher','test123',1,NULL),(3,'mahdi','musab','mahdi.musab@gmail.com','678 street','student','12345',1,'10'),(4,'said','musa','said.musa@gmail.com','ahahah','teacher','00000',1,NULL),(5,'HARUN ','person','HARUN.person@gmail.com','student','student','uuuuuuu',1,'12');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-28 10:47:53
