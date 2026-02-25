# MySQL Queries Reference - Onkar Powerstation Booking System

This document contains all MySQL queries used in the application.

## Database Creation

```sql
CREATE DATABASE IF NOT EXISTS onkar_powerstation;
USE onkar_powerstation;
```

## Table Creation Queries

### 1. Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Cities Table
```sql
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
```

### 3. Stations Table
```sql
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
```

### 4. Vehicles Table
```sql
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
```

### 5. Bookings Table
```sql
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
```

### 6. Time Slots Table
```sql
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
```

## Data Insertion Queries

### Insert Cities
```sql
INSERT INTO cities (name, state, latitude, longitude) VALUES
('Mumbai', 'Maharashtra', 19.0760, 72.8777),
('Delhi', 'Delhi', 28.7041, 77.1025),
('Bangalore', 'Karnataka', 12.9716, 77.5946),
('Hyderabad', 'Telangana', 17.3850, 78.4867),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707)
ON DUPLICATE KEY UPDATE name=name;
```

### Insert Test User
```sql
INSERT INTO users (name, email, password) VALUES
('Test User', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE email=email;
```

### Insert Test Vehicles
```sql
INSERT INTO vehicles (user_id, vehicle_number, type) VALUES
(1, 'MH-12-AB-1234', 'EV'),
(1, 'DL-09-CD-5678', 'CNG'),
(1, 'KA-05-EF-9012', 'EV')
ON DUPLICATE KEY UPDATE vehicle_number=vehicle_number;
```

## Application Queries (Used in PHP)

### Authentication Queries

#### Check if email exists
```sql
SELECT id FROM users WHERE email = ?;
```

#### Register new user
```sql
INSERT INTO users (name, email, password) VALUES (?, ?, ?);
```

#### Login - Get user by email
```sql
SELECT id, name, email, password FROM users WHERE email = ?;
```

### Vehicle Queries

#### Get user vehicles
```sql
SELECT id, vehicle_number, type, created_at 
FROM vehicles 
WHERE user_id = ? 
ORDER BY created_at DESC;
```

#### Check vehicle count
```sql
SELECT COUNT(*) as count FROM vehicles WHERE user_id = ?;
```

#### Check if vehicle exists
```sql
SELECT id FROM vehicles WHERE user_id = ? AND vehicle_number = ?;
```

#### Add vehicle
```sql
INSERT INTO vehicles (user_id, vehicle_number, type) VALUES (?, ?, ?);
```

#### Delete vehicle
```sql
DELETE FROM vehicles WHERE id = ? AND user_id = ?;
```

### Station Queries

#### Get all cities
```sql
SELECT id, name, state, latitude, longitude 
FROM cities 
ORDER BY name;
```

#### Get city by name
```sql
SELECT id, name, state, latitude, longitude 
FROM cities 
WHERE name = ? OR CONCAT(name, ', ', state) = ?;
```

#### Get stations by city
```sql
SELECT s.id, s.name, s.location, s.latitude, s.longitude, s.type, 
       s.available_slots, s.total_slots, s.image_url, s.status
FROM stations s
WHERE s.city_id = ? AND s.status = 'active'
ORDER BY s.name;
```

#### Get all stations
```sql
SELECT s.id, s.name, s.location, s.latitude, s.longitude, s.type, 
       s.available_slots, s.total_slots, s.image_url, s.status,
       c.name as city_name, c.state
FROM stations s
JOIN cities c ON s.city_id = c.id
WHERE s.status = 'active'
ORDER BY s.name;
```

#### Get stations by type
```sql
SELECT s.id, s.name, s.location, s.latitude, s.longitude, s.type, 
       s.available_slots, s.total_slots, s.image_url, s.status,
       c.name as city_name, c.state
FROM stations s
JOIN cities c ON s.city_id = c.id
WHERE s.type = ? AND s.status = 'active'
ORDER BY s.name;
```

#### Get station details
```sql
SELECT id, type, available_slots 
FROM stations 
WHERE id = ? AND status = 'active';
```

#### Update station availability (decrease)
```sql
UPDATE stations 
SET available_slots = available_slots - 1 
WHERE id = ?;
```

#### Update station availability (increase)
```sql
UPDATE stations 
SET available_slots = available_slots + 1 
WHERE id = ?;
```

### Booking Queries

#### Get user bookings
```sql
SELECT b.id, b.booking_date, b.time_slot, b.status,
       s.id as station_id, s.name as station_name, s.type as station_type, 
       s.image_url as station_image,
       v.id as vehicle_id, v.vehicle_number, v.type as vehicle_type
FROM bookings b
JOIN stations s ON b.station_id = s.id
JOIN vehicles v ON b.vehicle_id = v.id
WHERE b.user_id = ?
ORDER BY b.booking_date DESC, b.created_at DESC;
```

#### Create booking
```sql
INSERT INTO bookings (user_id, station_id, vehicle_id, booking_date, time_slot, status) 
VALUES (?, ?, ?, ?, ?, 'confirmed');
```

#### Get booking details
```sql
SELECT b.id, b.booking_date, b.time_slot, b.status,
       s.id as station_id, s.name as station_name, s.type as station_type, 
       s.image_url as station_image,
       v.id as vehicle_id, v.vehicle_number, v.type as vehicle_type
FROM bookings b
JOIN stations s ON b.station_id = s.id
JOIN vehicles v ON b.vehicle_id = v.id
WHERE b.id = ?;
```

#### Update booking status
```sql
UPDATE bookings 
SET status = ? 
WHERE id = ? AND user_id = ?;
```

#### Verify booking ownership
```sql
SELECT id, station_id 
FROM bookings 
WHERE id = ? AND user_id = ?;
```

## Utility Queries

### Count total users
```sql
SELECT COUNT(*) as total_users FROM users;
```

### Count total stations
```sql
SELECT COUNT(*) as total_stations FROM stations;
```

### Count total bookings
```sql
SELECT COUNT(*) as total_bookings FROM bookings;
```

### Get stations with low availability
```sql
SELECT s.name, s.location, s.available_slots, s.total_slots, c.name as city_name
FROM stations s
JOIN cities c ON s.city_id = c.id
WHERE s.available_slots <= 2 AND s.status = 'active'
ORDER BY s.available_slots ASC;
```

### Get user booking statistics
```sql
SELECT 
    COUNT(*) as total_bookings,
    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
FROM bookings
WHERE user_id = ?;
```

### Get popular stations
```sql
SELECT s.name, s.location, COUNT(b.id) as booking_count, c.name as city_name
FROM stations s
LEFT JOIN bookings b ON s.id = b.station_id
JOIN cities c ON s.city_id = c.id
WHERE s.status = 'active'
GROUP BY s.id
ORDER BY booking_count DESC
LIMIT 10;
```

## Notes

- All queries use prepared statements with placeholders (`?`) for security
- Foreign key constraints ensure data integrity
- Indexes are created on frequently queried columns for performance
- `ON DELETE CASCADE` ensures related records are deleted when parent is deleted
- Timestamps are automatically managed with `CURRENT_TIMESTAMP`
