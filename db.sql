-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema rsa_scheduler
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `rsa_scheduler` ;

-- -----------------------------------------------------
-- Schema rsa_scheduler
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `rsa_scheduler` DEFAULT CHARACTER SET latin1 ;
USE `rsa_scheduler` ;

-- -----------------------------------------------------
-- Table `rsa_scheduler`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `rsa_scheduler`.`user` ;

CREATE TABLE IF NOT EXISTS `rsa_scheduler`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `address` VARCHAR(45) NOT NULL,
  `role` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rsa_scheduler`.`class`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `rsa_scheduler`.`class` ;

CREATE TABLE IF NOT EXISTS `rsa_scheduler`.`class` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `class_name` VARCHAR(45) NOT NULL,
  `grade` VARCHAR(45) NOT NULL,
  `classcol` VARCHAR(45) NULL,
  `teacher_id` INT NOT NULL,
  PRIMARY KEY (`id`, `teacher_id`),
  INDEX `fk_class_user_idx` (`teacher_id` ASC) ,
  CONSTRAINT `fk_class_user`
    FOREIGN KEY (`teacher_id`)
    REFERENCES `rsa_scheduler`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rsa_scheduler`.`calendar`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `rsa_scheduler`.`calendar` ;

CREATE TABLE IF NOT EXISTS `rsa_scheduler`.`calendar` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `end_time` DATETIME NULL,
  `start_time` DATETIME NULL,
  `class_id` INT NOT NULL,
  PRIMARY KEY (`id`, `class_id`),
  INDEX `fk_calendar_class1_idx` (`class_id` ASC) ,
  CONSTRAINT `fk_calendar_class1`
    FOREIGN KEY (`class_id`)
    REFERENCES `rsa_scheduler`.`class` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rsa_scheduler`.`student_class`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `rsa_scheduler`.`student_class` ;

CREATE TABLE IF NOT EXISTS `rsa_scheduler`.`student_class` (
  `student_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  PRIMARY KEY (`student_id`, `class_id`),
  INDEX `fk_user_has_class_class1_idx` (`class_id` ASC) ,
  INDEX `fk_user_has_class_user1_idx` (`student_id` ASC) ,
  CONSTRAINT `fk_user_has_class_user1`
    FOREIGN KEY (`student_id`)
    REFERENCES `rsa_scheduler`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_class_class1`
    FOREIGN KEY (`class_id`)
    REFERENCES `rsa_scheduler`.`class` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


INSERT INTO `rsa_scheduler`.`user` (`first_name`, `last_name`, `email`, `address`, `role`, `password`, `status`) VALUES ('bob', 'adam', 'bob.adam@gmail.com', '100 mian street', 'ADMIN', 'test', '1');


INSERT INTO `rsa_scheduler`.`user` (`first_name`, `last_name`, `email`, `address`, `role`, `password`, `status`) VALUES ('ali', 'ahmed', 'ali.ahmed@gmail.com', 'test street', 'TEACHER', 'test123', '1');

INSERT INTO `rsa_scheduler`.`class` (`class_name`, `grade`, `teacher_id`) VALUES ('ENG101', '3', '2');

