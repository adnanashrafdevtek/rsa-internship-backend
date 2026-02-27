-- ============================================
-- Database: rsa_scheduler (Integrated Date & Day-of-Week)
-- ============================================

CREATE DATABASE IF NOT EXISTS rsa_scheduler;
USE rsa_scheduler;

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
  `room` varchar(255) DEFAULT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idcalendar`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar`
--

INSERT INTO `calendar` VALUES (61,'2025-07-16 01:00:00','2025-07-16 06:30:00',3,'3',2,NULL,'102',NULL,NULL),(65,'2025-07-25 09:15:00','2025-07-25 11:45:00',9,'Muhammad Hussein',NULL,NULL,'103',NULL,NULL),(66,'2025-07-29 00:30:00','2025-07-29 05:30:00',1,'Science',NULL,NULL,'Library',NULL,NULL),(70,'2025-08-01 08:11:00','2025-08-02 09:12:00',NULL,'IEEEEe',2,'NMAMAMMAMAMMAMMAMAMA','201',NULL,NULL),(86,'2025-08-26 22:09:00','2025-08-26 23:09:00',NULL,'DEIJDIEgeuyikusjlkaf',5,'description',NULL,NULL,NULL),(91,'2025-10-03 08:10:00','2025-10-03 10:40:00',NULL,'Math - Grade 5 - Room 103',2,'Subject: Math, Grade: 5, Room: 103, Teacher: ali ahmed, A/B Day: A, Recurring: Fri',NULL,'5','Math'),(99,'2025-09-29 08:20:00','2025-09-29 10:00:00',NULL,'English - Grade 3 - Room 1301',7,'Subject: English, Grade: 3, Room: 1301, Teacher: Emma Hall, A/B Day: A, Recurring: Mon',NULL,'3','English'),(100,'2025-10-15 09:55:00','2025-10-15 11:10:00',NULL,'Math - Grade 7 - Room 103',14,'Subject: Math, Grade: 7, Room: 103, Teacher: Sara Ali, A/B Day: A, Recurring: Wed',NULL,'7','Math'),(102,'2025-10-17 08:20:00','2025-10-17 09:50:00',NULL,'Math - Grade 4 - Room 607',2,'Subject: Math, Grade: 4, Room: 607, Teacher: ali ahmed, A/B Day: A, Recurring: Fri',NULL,'4','Math');
-- Conflict test: user 2 and user 7 at same time/day
INSERT INTO `calendar` (start_time, end_time, class_id, event_title, user_id, description, room, grade, subject)
VALUES ('2025-11-25 08:15:00','2025-11-25 09:45:00', NULL, 'Conflict Test - Teacher 2', 2, 'Overlap with Teacher 7', 'Room 200', NULL, NULL);
INSERT INTO `calendar` (start_time, end_time, class_id, event_title, user_id, description, room, grade, subject)
VALUES ('2025-11-25 08:15:00','2025-11-25 09:45:00', NULL, 'Conflict Test - Teacher 7', 7, 'Overlap with Teacher 2', 'Room 200', NULL, NULL);

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

INSERT INTO `class` VALUES (11,'Math','10',2,'2025-07-31 20:30:00','2025-08-01 23:45:00','Wed,Thu'),(12,'Physics','11',2,'2025-07-27 14:00:00','2026-01-01 20:00:00','Tue,Fri'),(18,'ENG 101','12',2,'2025-08-10 13:30:00','2025-10-10 15:00:00','Tue,Thu');

--
-- Table structure for table `student_class`
--

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

INSERT INTO `student_class` VALUES (3,11),(5,11),(3,12),(5,12);

--
-- Table structure for table `teacher_availability`
--

DROP TABLE IF EXISTS `teacher_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_availability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `teacher_availability_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_availability`
--

INSERT INTO `teacher_availability` VALUES (1,2,1,'08:00:00','12:00:00','2024-06-01','2024-12-31','2025-09-27 14:30:19'),(2,2,3,'09:30:00','15:00:00','2024-06-01','2024-12-31','2025-09-27 14:30:19'),(3,2,5,'07:45:00','11:30:00','2024-06-01','2024-12-31','2025-09-27 14:30:19'),(4,7,1,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(5,7,3,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(6,8,2,'09:00:00','12:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(7,8,4,'14:00:00','17:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(8,9,1,'10:00:00','12:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(9,9,5,'09:00:00','11:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(10,10,2,'08:30:00','11:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(11,10,4,'09:00:00','12:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(12,11,3,'08:00:00','12:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(13,11,5,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(14,12,1,'07:45:00','11:45:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(15,12,4,'12:30:00','15:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(16,13,2,'10:00:00','13:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(17,13,5,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(18,14,3,'09:30:00','12:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(19,14,5,'10:00:00','13:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(20,15,1,'08:30:00','11:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(21,15,4,'14:30:00','17:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(22,16,2,'11:00:00','13:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(23,16,4,'09:30:00','12:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(24,2,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(25,2,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(26,2,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(27,2,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(28,2,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(29,7,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(30,7,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(31,7,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(32,7,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(33,7,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(34,8,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(35,8,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(36,8,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(37,8,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(38,8,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(39,9,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(40,9,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(41,9,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(42,9,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(43,9,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(44,10,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(45,10,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(46,10,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(47,10,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(48,10,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(49,11,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(50,11,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(51,11,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(52,11,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(53,11,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(54,12,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(55,12,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(56,12,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(57,12,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(58,12,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(59,13,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(60,13,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(61,13,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(62,13,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(63,13,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(64,14,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(65,14,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(66,14,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(67,14,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(68,14,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(69,15,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(70,15,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(71,15,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(72,15,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(73,15,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(74,16,1,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(75,16,2,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(76,16,3,'15:00:00','17:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(77,16,4,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-10-25 10:00:00'),(78,16,5,'11:30:00','14:30:00','2025-09-01','2025-12-31','2025-10-25 10:00:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

INSERT INTO `user` VALUES (1,'bob','adam','bob.adam@gmail.com','100 mian street','admin','test',1,NULL),(2,'ali','ahmed','ali.ahmed@gmail.com','test street','teacher','test123',1,NULL),(3,'mahdi','musab','mahdi.musab@gmail.com','678 street','student','12345',1,'10'),(5,'HARUN ','person','HARUN.person@gmail.com','student','student','uuuuuuu',1,'12'),(7,'Emma','Hall','emma.hall@rsa.edu','123 Oak St','teacher','changeme',1,NULL),(8,'Liam','Patel','liam.patel@rsa.edu','34 Pine Ave','teacher','changeme',1,NULL),(9,'Wei','Li','wei.li@rsa.edu','56 Maple Rd','teacher','changeme',1,NULL),(10,'Maria','Garcia','maria.garcia@rsa.edu','78 Cedar St','teacher','changeme',1,NULL),(11,'James','Smith','james.smith@rsa.edu','90 Birch Blvd','teacher','changeme',1,NULL),(12,'Fatima','Khan','fatima.khan@rsa.edu','12 Cherry Ln','teacher','changeme',1,NULL),(13,'Diego','Fernandez','diego.fernandez@rsa.edu','23 Willow Way','teacher','changeme',1,NULL),(14,'Sara','Ali','sara.ali@rsa.edu','45 Spruce Ct','teacher','changeme',1,NULL),(15,'Andrew','Choi','andrew.choi@rsa.edu','67 Elm Sq','teacher','changeme',1,NULL),(16,'Nina','Ivanov','nina.ivanov@rsa.edu','89 Poplar Dr','teacher','changeme',1,NULL);
-- Teacher ID 7
INSERT INTO class (name, grade_level, teacher_id, start_time, end_time, recurring_days) VALUES
('Math', '9', 7, '2025-11-25 06:30:00', '2025-11-25 08:00:00', 'Mon,Tue,Wed,Thu,Fri'),
('Science', '10', 7, '2025-11-25 08:15:00', '2025-11-25 09:45:00', 'Mon,Tue,Wed,Thu,Fri');

-- Teacher ID 8
INSERT INTO class (name, grade_level, teacher_id, start_time, end_time, recurring_days) VALUES
('History', '11', 8, '2025-11-25 09:50:00', '2025-11-25 11:20:00', 'Mon,Tue,Wed,Thu,Fri'),
('English', '12', 8, '2025-11-25 11:30:00', '2025-11-25 13:00:00', 'Mon,Tue,Wed,Thu,Fri');

-- Teacher ID 9
INSERT INTO class (name, grade_level, teacher_id, start_time, end_time, recurring_days) VALUES
('Physics', '10', 9, '2025-11-25 06:30:00', '2025-11-25 08:00:00', 'Mon,Tue,Wed,Thu,Fri'),
('Chemistry', '11', 9, '2025-11-25 08:15:00', '2025-11-25 09:45:00', 'Mon,Tue,Wed,Thu,Fri');

-- Teacher ID 10
INSERT INTO class (name, grade_level, teacher_id, start_time, end_time, recurring_days) VALUES
('Art', '9', 10, '2025-11-25 12:00:00', '2025-11-25 13:30:00', 'Mon,Tue,Wed,Thu,Fri'),
('Music', '10', 10, '2025-11-25 13:45:00', '2025-11-25 15:15:00', 'Mon,Tue,Wed,Thu,Fri');

-- 4. TEACHER AVAILABILITY (Uses both Date and Day Number)
DROP TABLE IF EXISTS teacher_availability;
CREATE TABLE teacher_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  available_date DATE NOT NULL,      -- Used for specific date checks
  day_of_week TINYINT NOT NULL,      -- Used for UI placement (1=Mon, 2=Tue, etc.)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ta_teacher FOREIGN KEY (teacher_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Put teachers on Monday, Jan 19, 2026 (Monday = Day 1)
INSERT INTO teacher_availability (teacher_id, available_date, day_of_week, start_time, end_time) VALUES
(7, '2026-01-19', 1, '10:30:00', '13:30:00'), -- Emma Hall
(2, '2026-01-19', 1, '10:30:00', '13:30:00'), -- Ali Ahmed
(10, '2026-01-19', 1, '10:30:00', '13:30:00'); -- Maria Garcia

-- 5. CALENDAR TABLE (Updated to include recurring_day for UI support)
DROP TABLE IF EXISTS calendar;
CREATE TABLE calendar (
  idcalendar INT AUTO_INCREMENT PRIMARY KEY,
  start_time DATETIME,
  end_time DATETIME,
  class_id INT,
  event_title VARCHAR(255),
  duty VARCHAR(50),
  user_id INT,
  description TEXT,
  room VARCHAR(255),
  grade VARCHAR(10),
  subject VARCHAR(255),
  recurring_day INT DEFAULT NULL -- Helps the UI place the event in the right column
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
