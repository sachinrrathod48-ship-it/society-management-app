-- Smart Society Management System Schema
-- Database Creation Script

CREATE DATABASE IF NOT EXISTS society_db;
USE society_db;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Residents Table
CREATE TABLE IF NOT EXISTS residents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    flat_number VARCHAR(20) NOT NULL,
    wing VARCHAR(10) NOT NULL,
    occupation VARCHAR(50) DEFAULT 'Resident',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    role VARCHAR(20) DEFAULT 'resident',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Security Staff Table
CREATE TABLE IF NOT EXISTS security (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    shift ENUM('Morning', 'Evening', 'Night') DEFAULT 'Morning',
    status ENUM('Active', 'Inactive', 'On Duty') DEFAULT 'Active',
    role VARCHAR(20) DEFAULT 'security',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    flat_number VARCHAR(20) NOT NULL,
    resident_name VARCHAR(100) NOT NULL,
    purpose VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    entry_time TIME NOT NULL,
    exit_time TIME DEFAULT NULL,
    status ENUM('Inside', 'Left') DEFAULT 'Inside',
    recorded_by_security_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    flat_number VARCHAR(20) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Resolved', 'Rejected') DEFAULT 'Pending',
    admin_remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
);

-- 6. Maintenance Bills Table
CREATE TABLE IF NOT EXISTS maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    flat_number VARCHAR(20) NOT NULL,
    month_year VARCHAR(30) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    payment_date DATE DEFAULT NULL,
    payment_method VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
);

-- 7. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    content TEXT NOT NULL,
    priority ENUM('General', 'Important', 'Urgent') DEFAULT 'General',
    posted_by VARCHAR(100) DEFAULT 'Society Management',
    date_posted DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    category ENUM('Essential', 'Medical', 'Security', 'Maintenance') DEFAULT 'Essential',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
