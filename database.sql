-- Onkar Powerstation Booking System Database Schema
-- Create this database in MySQL/MariaDB

-- Create Database
CREATE DATABASE IF NOT EXISTS onkar_powerstation;
USE onkar_powerstation;

-- Table: users
-- Stores user account information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: cities
-- Stores city information with coordinates
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: stations
-- Stores charging/filling station information
CREATE TABLE IF NOT EXISTS stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city_id INT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    type ENUM('EV', 'CNG') NOT NULL,
    available_slots INT DEFAULT 0,
    total_slots INT DEFAULT 5,
    image_url VARCHAR(500),
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city (city_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: vehicles
-- Stores user vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    type ENUM('EV', 'CNG') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    UNIQUE KEY unique_user_vehicle (user_id, vehicle_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bookings
-- Stores booking information
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_station (station_id),
    INDEX idx_date (booking_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: time_slots
-- Stores available time slots for bookings
CREATE TABLE IF NOT EXISTS time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    slot_time VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    booking_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_station_date (station_id, booking_date),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Cities
INSERT INTO cities (name, state, latitude, longitude) VALUES
('Mumbai', 'Maharashtra', 19.0760, 72.8777),
('Delhi', 'Delhi', 28.7041, 77.1025),
('Bangalore', 'Karnataka', 12.9716, 77.5946),
('Hyderabad', 'Telangana', 17.3850, 78.4867),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707)
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Stations (for each city)
-- Mumbai Stations
INSERT INTO stations (name, location, city_id, latitude, longitude, type, available_slots, total_slots, image_url, status) VALUES
('EVPoint Mumbai1', 'Area 1, Mumbai, Maharashtra', 1, 19.0760, 72.8777, 'EV', 3, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Mumbai2', 'Area 2, Mumbai, Maharashtra', 1, 19.0810, 72.8827, 'CNG', 2, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Mumbai3', 'Area 3, Mumbai, Maharashtra', 1, 19.0710, 72.8727, 'EV', 4, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Mumbai4', 'Area 4, Mumbai, Maharashtra', 1, 19.0860, 72.8877, 'CNG', 1, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Mumbai5', 'Area 5, Mumbai, Maharashtra', 1, 19.0660, 72.8677, 'EV', 5, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Mumbai6', 'Area 6, Mumbai, Maharashtra', 1, 19.0910, 72.8927, 'CNG', 3, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Delhi Stations
INSERT INTO stations (name, location, city_id, latitude, longitude, type, available_slots, total_slots, image_url, status) VALUES
('EVPoint Delhi1', 'Area 1, Delhi, Delhi', 2, 28.7041, 77.1025, 'EV', 2, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Delhi2', 'Area 2, Delhi, Delhi', 2, 28.7091, 77.1075, 'CNG', 4, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Delhi3', 'Area 3, Delhi, Delhi', 2, 28.6991, 77.0975, 'EV', 3, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Delhi4', 'Area 4, Delhi, Delhi', 2, 28.7141, 77.1125, 'CNG', 1, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Delhi5', 'Area 5, Delhi, Delhi', 2, 28.6941, 77.0925, 'EV', 5, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Delhi6', 'Area 6, Delhi, Delhi', 2, 28.7191, 77.1175, 'CNG', 2, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Bangalore Stations
INSERT INTO stations (name, location, city_id, latitude, longitude, type, available_slots, total_slots, image_url, status) VALUES
('EVPoint Bangalore1', 'Area 1, Bangalore, Karnataka', 3, 12.9716, 77.5946, 'EV', 4, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Bangalore2', 'Area 2, Bangalore, Karnataka', 3, 12.9766, 77.5996, 'CNG', 3, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Bangalore3', 'Area 3, Bangalore, Karnataka', 3, 12.9666, 77.5896, 'EV', 2, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Bangalore4', 'Area 4, Bangalore, Karnataka', 3, 12.9816, 77.6046, 'CNG', 5, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Bangalore5', 'Area 5, Bangalore, Karnataka', 3, 12.9616, 77.5796, 'EV', 1, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Bangalore6', 'Area 6, Bangalore, Karnataka', 3, 12.9866, 77.6096, 'CNG', 4, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Hyderabad Stations
INSERT INTO stations (name, location, city_id, latitude, longitude, type, available_slots, total_slots, image_url, status) VALUES
('EVPoint Hyderabad1', 'Area 1, Hyderabad, Telangana', 4, 17.3850, 78.4867, 'EV', 3, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Hyderabad2', 'Area 2, Hyderabad, Telangana', 4, 17.3900, 78.4917, 'CNG', 2, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Hyderabad3', 'Area 3, Hyderabad, Telangana', 4, 17.3800, 78.4817, 'EV', 5, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Hyderabad4', 'Area 4, Hyderabad, Telangana', 4, 17.3950, 78.4967, 'CNG', 1, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Hyderabad5', 'Area 5, Hyderabad, Telangana', 4, 17.3750, 78.4767, 'EV', 4, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Hyderabad6', 'Area 6, Hyderabad, Telangana', 4, 17.4000, 78.5017, 'CNG', 3, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Chennai Stations
INSERT INTO stations (name, location, city_id, latitude, longitude, type, available_slots, total_slots, image_url, status) VALUES
('EVPoint Chennai1', 'Area 1, Chennai, Tamil Nadu', 5, 13.0827, 80.2707, 'EV', 2, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Chennai2', 'Area 2, Chennai, Tamil Nadu', 5, 13.0877, 80.2757, 'CNG', 4, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Chennai3', 'Area 3, Chennai, Tamil Nadu', 5, 13.0777, 80.2657, 'EV', 3, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Chennai4', 'Area 4, Chennai, Tamil Nadu', 5, 13.0927, 80.2807, 'CNG', 5, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active'),
('EVPoint Chennai5', 'Area 5, Chennai, Tamil Nadu', 5, 13.0727, 80.2607, 'EV', 1, 5, 'https://content.jdmagicbox.com/v2/comp/pune/m1/020pxx20.xx20.240404160742.g4m1/catalogue/arjun-engineering-services-pune-electric-vehicle-charging-stations-v1ug2n3gfn.jpg', 'active'),
('CNGPoint Chennai6', 'Area 6, Chennai, Tamil Nadu', 5, 13.0977, 80.2857, 'CNG', 2, 5, 'https://content.jdmagicbox.com/comp/karimnagar/j6/pwfl1521878054q9e7j6/catalogue/madhu-filling-station-vemulawada-karimnagar-cng-filling-stations-dt23y.jpg', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Test User (password: test123)
-- Password hash generated using password_hash('test123', PASSWORD_DEFAULT)
INSERT INTO users (name, email, password) VALUES
('Test User', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Test Vehicles for Test User
INSERT INTO vehicles (user_id, vehicle_number, type) VALUES
(1, 'MH-12-AB-1234', 'EV'),
(1, 'DL-09-CD-5678', 'CNG'),
(1, 'KA-05-EF-9012', 'EV')
ON DUPLICATE KEY UPDATE vehicle_number=vehicle_number;
