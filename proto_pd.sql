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
