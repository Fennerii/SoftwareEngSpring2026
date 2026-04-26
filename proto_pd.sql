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

-- you might have to alter table so do the following:
--ALTER table printers ADD black INT;
--ALTER table printers ADD cyan INT;
--ALTER table printers ADD magenta INT;
--ALTER table printers ADD yellow INT;
