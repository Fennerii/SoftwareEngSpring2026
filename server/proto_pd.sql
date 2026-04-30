CREATE DATABASE IF NOT EXISTS proto_pd;
USE proto_pd;
 
CREATE TABLE IF NOT EXISTS printers (
    serial_number VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    ip VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(255),
    uptime VARCHAR(50),
    hardware VARCHAR(255),
    page_count INT,
    color BOOLEAN,
    is_error BOOLEAN,
    black INT,
    cyan INT,
    magenta INT,
    yellow INT
);
 
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE IF NOT EXISTS work_history (
    work_id INT AUTO_INCREMENT PRIMARY KEY,
    printer_serial VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printer_serial) REFERENCES printers(serial_number),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
 
CREATE TABLE IF NOT EXISTS locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('academic', 'dorm', 'storage') NOT NULL,
    group_name VARCHAR(255)
);
 
INSERT IGNORE INTO locations (name, type, group_name) VALUES
-- Academic Buildings
('Engineering and Innovation Hub', 'academic', NULL),
('Peregrine Dining Hall', 'academic', NULL),
('Louis and Mildred Resnick Hall', 'academic', NULL),
('Smiley Art Building', 'academic', NULL),
('Wooster Hall', 'academic', NULL),
('Atrium', 'academic', NULL),
('Academic College Hall', 'academic', NULL),
('Coykendall Science Building', 'academic', NULL),
('Lecture Center', 'academic', NULL),
('Science Hall', 'academic', NULL),
('Humanities', 'academic', NULL),
('Old Main', 'academic', NULL),
('Old Library', 'academic', NULL),
('Van Den Berg Hall', 'academic', NULL),
-- Dorms - Academic Way
('College Hall', 'dorm', 'Academic Way'),
('Shango Hall / ShangoEOP', 'dorm', 'Academic Way'),
('Bouton Hall', 'dorm', 'Academic Way'),
-- Dorms - Parker Quad
('Capen Hall / CapenEOP', 'dorm', 'Parker Quad'),
('Scudder Hall', 'dorm', 'Parker Quad'),
('Bliss Hall', 'dorm', 'Parker Quad'),
('Gage Hall', 'dorm', 'Parker Quad'),
-- Dorms - Peregrine Suites
('Awosting Hall', 'dorm', 'Peregrine Suites'),
('Mohonk Hall', 'dorm', 'Peregrine Suites'),
('Shawanagunk Hall', 'dorm', 'Peregrine Suites'),
('Ashokan Hall', 'dorm', 'Peregrine Suites'),
('Minnewaska Hall', 'dorm', 'Peregrine Suites'),
-- Dorms - Southside
('Ridgeview Hall', 'dorm', 'Southside Dorms'),
('Esopus Hall', 'dorm', 'Southside Dorms'),
('Lenape Hall', 'dorm', 'Southside Dorms'),
-- Storage
('Esopus', 'storage', NULL),
('Gage', 'storage', NULL),
('CSB 117', 'storage', NULL),
('LC 06', 'storage', NULL),
('OM 134', 'storage', NULL),
('Minnewaska 007', 'storage', NULL),
('SH 139', 'storage', NULL),
('VH 113', 'storage', NULL);
 
CREATE TABLE IF NOT EXISTS toner_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    toner_model VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    counted_by INT NOT NULL,
    counted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (counted_by) REFERENCES users(user_id)
);
 
CREATE TABLE IF NOT EXISTS paper_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    quantity INT NOT NULL,
    counted_by INT NOT NULL,
    counted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (counted_by) REFERENCES users(user_id)
);
 
-- Useful cleanup commands:
-- TRUNCATE TABLE toner_log;
-- TRUNCATE TABLE paper_log;
-- TRUNCATE TABLE work_history;
-- TRUNCATE TABLE users;
