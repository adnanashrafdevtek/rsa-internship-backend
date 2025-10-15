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
  `room` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idcalendar`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar`
--

LOCK TABLES `calendar` WRITE;
/*!40000 ALTER TABLE `calendar` DISABLE KEYS */;
INSERT INTO `calendar` VALUES (59,'2025-07-16 10:00:00','2025-07-16 11:00:00',2,'2',4,NULL,'Gym'),(61,'2025-07-16 01:00:00','2025-07-16 06:30:00',3,'3',2,NULL,'102'),(64,'2025-07-14 01:30:00','2025-07-14 05:00:00',6,'6',4,NULL,'101'),(65,'2025-07-25 09:15:00','2025-07-25 11:45:00',9,'Muhammad Hussein',NULL,NULL,'103'),(66,'2025-07-29 00:30:00','2025-07-29 05:30:00',1,'Science',NULL,NULL,'Library'),(70,'2025-08-01 08:11:00','2025-08-02 09:12:00',NULL,'IEEEEe',2,'NMAMAMMAMAMMAMMAMAMA','201'),(86,'2025-08-26 22:09:00','2025-08-26 23:09:00',NULL,'DEIJDIEgeuyikusjlkaf',5,'description',NULL),(91,'2025-10-03 08:10:00','2025-10-03 10:40:00',NULL,'Math - Grade 5 - Room 103',2,'Subject: Math, Grade: 5, Room: 103, Teacher: ali ahmed, A/B Day: A, Recurring: Fri',NULL),(99,'2025-09-29 08:20:00','2025-09-29 10:00:00',NULL,'English - Grade 3 - Room 1301',7,'Subject: English, Grade: 3, Room: 1301, Teacher: Emma Hall, A/B Day: A, Recurring: Mon',NULL),(100,'2025-10-15 09:55:00','2025-10-15 11:10:00',NULL,'Math - Grade 7 - Room 103',14,'Subject: Math, Grade: 7, Room: 103, Teacher: Sara Ali, A/B Day: A, Recurring: Wed',NULL),(101,'2025-10-15 09:00:00','2025-10-15 10:00:00',11,'Math Class',4,'Algebra lesson',NULL),(102,'2025-10-17 08:20:00','2025-10-17 09:50:00',NULL,'Math - Grade 4 - Room 607',2,'Subject: Math, Grade: 4, Room: 607, Teacher: ali ahmed, A/B Day: A, Recurring: Fri',NULL);
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

LOCK TABLES `teacher_availability` WRITE;
/*!40000 ALTER TABLE `teacher_availability` DISABLE KEYS */;
INSERT INTO `teacher_availability` VALUES (1,2,1,'08:00:00','12:00:00','2024-06-01','2024-12-31','2025-09-27 14:30:19'),(2,2,3,'09:30:00','15:00:00','2024-06-01','2024-12-31','2025-09-27 14:30:19'),(3,2,5,'07:45:00','11:30:00','2024-06-01','2024-12-31','2025-09-27 14:30:19'),(4,7,1,'08:00:00','11:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(5,7,3,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(6,8,2,'09:00:00','12:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(7,8,4,'14:00:00','17:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(8,9,1,'10:00:00','12:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(9,9,5,'09:00:00','11:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(10,10,2,'08:30:00','11:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(11,10,4,'09:00:00','12:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(12,11,3,'08:00:00','12:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(13,11,5,'13:00:00','16:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(14,12,1,'07:45:00','11:45:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(15,12,4,'12:30:00','15:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(16,13,2,'10:00:00','13:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(17,13,5,'08:00:00','10:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(18,14,3,'09:30:00','12:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(19,14,5,'10:00:00','13:00:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(20,15,1,'08:30:00','11:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(21,15,4,'14:30:00','17:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(22,16,2,'11:00:00','13:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19'),(23,16,4,'09:30:00','12:30:00','2025-09-01','2025-12-31','2025-09-27 14:30:19');
/*!40000 ALTER TABLE `teacher_availability` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'bob','adam','bob.adam@gmail.com','100 mian street','admin','test',1,NULL),(2,'ali','ahmed','ali.ahmed@gmail.com','test street','teacher','test123',1,NULL),(3,'mahdi','musab','mahdi.musab@gmail.com','678 street','student','12345',1,'10'),(4,'said','musa','said.musa@gmail.com','ahahah','teacher','00000',1,NULL),(5,'HARUN ','person','HARUN.person@gmail.com','student','student','uuuuuuu',1,'12'),(7,'Emma','Hall','emma.hall@rsa.edu','123 Oak St','teacher','changeme',1,NULL),(8,'Liam','Patel','liam.patel@rsa.edu','34 Pine Ave','teacher','changeme',1,NULL),(9,'Wei','Li','wei.li@rsa.edu','56 Maple Rd','teacher','changeme',1,NULL),(10,'Maria','Garcia','maria.garcia@rsa.edu','78 Cedar St','teacher','changeme',1,NULL),(11,'James','Smith','james.smith@rsa.edu','90 Birch Blvd','teacher','changeme',1,NULL),(12,'Fatima','Khan','fatima.khan@rsa.edu','12 Cherry Ln','teacher','changeme',1,NULL),(13,'Diego','Fernandez','diego.fernandez@rsa.edu','23 Willow Way','teacher','changeme',1,NULL),(14,'Sara','Ali','sara.ali@rsa.edu','45 Spruce Ct','teacher','changeme',1,NULL),(15,'Andrew','Choi','andrew.choi@rsa.edu','67 Elm Sq','teacher','changeme',1,NULL),(16,'Nina','Ivanov','nina.ivanov@rsa.edu','89 Poplar Dr','teacher','changeme',1,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activation`
--

DROP TABLE IF EXISTS `user_activation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_activation` (
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `token` (`token`),
  CONSTRAINT `user_activation_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activation`
--

LOCK TABLES `user_activation` WRITE;
/*!40000 ALTER TABLE `user_activation` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activation` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-15 16:35:00
