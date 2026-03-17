-- Initialize database with default settings
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS survey_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE survey_app;

-- Set timezone
SET time_zone = '+00:00';

SET FOREIGN_KEY_CHECKS = 1;
