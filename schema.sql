CREATE DATABASE members_info;
USE members_info;

CREATE TABLE members (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(40) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(60)
);
INSERT INTO members(name,age,gender,address,phone_number,email)
VALUES
('Alice Johnson', 30, 'Female', '123 Elm Street, Springfield', '123-456-7890', 'alice.johnson@example.com'),
('Bob Smith', 25, 'Male', '456 Maple Avenue, Shelbyville', '987-654-3210', 'bob.smith@example.com'),
('Carol Williams', 28, 'Female', '789 Oak Drive, Capital City', '555-555-5555', 'carol.williams@example.com');