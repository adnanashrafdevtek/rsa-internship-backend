-- ============================================
-- Database: rsa_scheduler (Integrated Date & Day-of-Week)
-- ============================================

CREATE DATABASE IF NOT EXISTS rsa_scheduler;
USE rsa_scheduler;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USER TABLE
DROP TABLE IF EXISTS user;
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  address VARCHAR(45) NOT NULL,
  role VARCHAR(45) NOT NULL,
  password VARCHAR(45) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  grade_level VARCHAR(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. DUTY TIMES
DROP TABLE IF EXISTS duty_times;
CREATE TABLE duty_times (
  id INT AUTO_INCREMENT PRIMARY KEY,
  duty_name VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

INSERT INTO duty_times (duty_name, start_time, end_time) VALUES
('morning', '07:30:00', '08:15:00'),
('lunch', '11:00:00', '12:00:00'),
('salah', '13:00:00', '14:00:00');

-- 3. USERS DATA
INSERT INTO user VALUES
(1,'bob','adam','bob.adam@gmail.com','100 main street','admin','test',1,NULL),
(2,'ali','ahmed','ali.ahmed@gmail.com','test street','teacher','test123',1,NULL),
(3,'mahdi','musab','mahdi.musab@gmail.com','678 street','student','12345',1,'10'),
(5,'HARUN','person','HARUN.person@gmail.com','student','student','uuuuuuu',1,'12'),
(7,'Emma','Hall','emma.hall@rsa.edu','123 Oak St','teacher','changeme',1,NULL),
(8,'Liam','Patel','liam.patel@rsa.edu','34 Pine Ave','teacher','changeme',1,NULL),
(9,'Wei','Li','wei.li@rsa.edu','56 Maple Rd','teacher','changeme',1,NULL),
(10,'Maria','Garcia','maria.garcia@rsa.edu','78 Cedar St','teacher','changeme',1,NULL),
(11,'James','Smith','james.smith@rsa.edu','90 Birch Blvd','teacher','changeme',1,NULL),
(12,'Fatima','Khan','fatima.khan@rsa.edu','12 Cherry Ln','teacher','changeme',1,NULL),
(13,'Diego','Fernandez','diego.fernandez@rsa.edu','23 Willow Way','teacher','changeme',1,NULL),
(14,'Sara','Ali','sara.ali@rsa.edu','45 Spruce Ct','teacher','changeme',1,NULL),
(15,'Andrew','Choi','andrew.choi@rsa.edu','67 Elm Sq','teacher','changeme',1,NULL),
(16,'Nina','Ivanov','nina.ivanov@rsa.edu','89 Poplar Dr','teacher','changeme',1,NULL);

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
