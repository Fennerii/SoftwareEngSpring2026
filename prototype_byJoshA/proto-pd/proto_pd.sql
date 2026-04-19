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
    is_error BOOLEAN
);

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'tech',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_history (
    work_id INT AUTO_INCREMENT PRIMARY KEY,
    printer_serial VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    work_type VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printer_serial) REFERENCES printers(serial_number),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
