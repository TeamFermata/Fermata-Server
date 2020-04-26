-- MySQL dump 10.13  Distrib 8.0.18, for Win64 (x86_64)
--
-- Host: db-3onik.pub-cdb.ntruss.com    Database: fermatadb
-- ------------------------------------------------------
-- Server version	5.7.29-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'b24b8832-78c5-11ea-821f-f220cd708cb9:1-12777';

--
-- Table structure for table `authinfect`
--

DROP TABLE IF EXISTS `authinfect`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authinfect` (
  `EmailAuthID` varchar(255) DEFAULT NULL,
  `GovermentID` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authinfect`
--

LOCK TABLES `authinfect` WRITE;
/*!40000 ALTER TABLE `authinfect` DISABLE KEYS */;
/*!40000 ALTER TABLE `authinfect` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authusers`
--

DROP TABLE IF EXISTS `authusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authusers` (
  `ID` varchar(255) DEFAULT NULL,
  `HashedPassword` varchar(255) DEFAULT NULL,
  `Salt` varchar(255) DEFAULT NULL,
  `SessionID` varchar(255) DEFAULT NULL,
  `SignupDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authusers`
--

LOCK TABLES `authusers` WRITE;
/*!40000 ALTER TABLE `authusers` DISABLE KEYS */;
/*!40000 ALTER TABLE `authusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `infectedpersons`
--

DROP TABLE IF EXISTS `infectedpersons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `infectedpersons` (
  `PersonUUID` varchar(255) DEFAULT NULL,
  `GovermentID` varchar(255) DEFAULT NULL,
  `PhoneLastNumber` varchar(255) DEFAULT NULL,
  `GovermentEMAIL` varchar(255) DEFAULT NULL,
  `Authed` tinyint(1) DEFAULT '0',
  `EmailAuthID` varchar(255) DEFAULT NULL,
  `infectedpersonscol` varchar(45) DEFAULT NULL,
  `infectedpersonscol1` varchar(45) DEFAULT NULL,
  KEY `idx_infectedpersons_PersonUUID` (`PersonUUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `infectedpersons`
--

LOCK TABLES `infectedpersons` WRITE;
/*!40000 ALTER TABLE `infectedpersons` DISABLE KEYS */;
/*!40000 ALTER TABLE `infectedpersons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scanchains`
--

DROP TABLE IF EXISTS `scanchains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scanchains` (
  `ScannerStaticID` varchar(255) DEFAULT NULL,
  `ScanedDynamicUUID` varchar(255) DEFAULT NULL,
  `ContactDayWithoutTime` date DEFAULT NULL,
  KEY `idx_scanchains_ScannerStaticID` (`ScannerStaticID`),
  KEY `idx_scanchains_ScanedDynamicUUID` (`ScanedDynamicUUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scanchains`
--

LOCK TABLES `scanchains` WRITE;
/*!40000 ALTER TABLE `scanchains` DISABLE KEYS */;
/*!40000 ALTER TABLE `scanchains` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-04-26 22:00:39
