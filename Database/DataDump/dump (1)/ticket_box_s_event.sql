-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ticket_box
-- ------------------------------------------------------
-- Server version	8.0.42

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

--
-- Table structure for table `s_event`
--

DROP TABLE IF EXISTS `s_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `s_event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `addr` varchar(255) DEFAULT NULL,
  `create_date` datetime(6) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `onl` bit(1) DEFAULT NULL,
  `org_info` varchar(255) DEFAULT NULL,
  `org_name` varchar(255) DEFAULT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `update_date` datetime(6) DEFAULT NULL,
  `approver_id` bigint DEFAULT NULL,
  `banner_id` bigint DEFAULT NULL,
  `contract_id` bigint DEFAULT NULL,
  `host_id` bigint DEFAULT NULL,
  `img_id` bigint DEFAULT NULL,
  `info_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfmdst3qkkymodxiu5n32reoi9` (`banner_id`),
  UNIQUE KEY `UKhee3scv919l5hkw27t7nggjoa` (`contract_id`),
  UNIQUE KEY `UK9t66vab1lit091p6h9u9tcg33` (`img_id`),
  UNIQUE KEY `UKsbrecjdscfivvjdsh06l0l84k` (`info_id`),
  KEY `FKbyuy03f73k5yjwgtqat48noi` (`approver_id`),
  KEY `FKt786aam19jlal7k0nnxx9kd10` (`host_id`),
  CONSTRAINT `FKbmcy63oulyghn4uplag6y756v` FOREIGN KEY (`info_id`) REFERENCES `s_pdf` (`id`),
  CONSTRAINT `FKbyuy03f73k5yjwgtqat48noi` FOREIGN KEY (`approver_id`) REFERENCES `s_user` (`id`),
  CONSTRAINT `FKf7bnv70nuneevyp7mfupmtrt2` FOREIGN KEY (`contract_id`) REFERENCES `s_pdf` (`id`),
  CONSTRAINT `FKnl25gjcxfh4gc3ud1ajxtov0m` FOREIGN KEY (`img_id`) REFERENCES `s_image` (`id`),
  CONSTRAINT `FKoqm3lna1itby668nt75cir0kv` FOREIGN KEY (`banner_id`) REFERENCES `s_image` (`id`),
  CONSTRAINT `FKt786aam19jlal7k0nnxx9kd10` FOREIGN KEY (`host_id`) REFERENCES `s_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `s_event`
--

LOCK TABLES `s_event` WRITE;
/*!40000 ALTER TABLE `s_event` DISABLE KEYS */;
/*!40000 ALTER TABLE `s_event` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-14 13:04:38
