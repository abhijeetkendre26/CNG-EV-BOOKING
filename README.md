# Onkar Powerstation Booking System - PHP/MySQL Setup Guide

This is a complete booking system for CNG and EV vehicle charging/filling stations with PHP backend and MySQL database.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher (or MariaDB)
- Apache/Nginx web server
- Web browser
- Google Maps API Key (for map functionality)

## Installation Steps

### 1. Database Setup

1. **Open MySQL/MariaDB command line or phpMyAdmin**

2. **Create the database and import schema:**
   ```sql
   -- Option 1: Using MySQL command line
   mysql -u root -p < database.sql
   
   -- Option 2: Using phpMyAdmin
   -- Import the database.sql file through phpMyAdmin interface
   ```

3. **Verify database creation:**
   ```sql
   USE onkar_powerstation;
   SHOW TABLES;
   ```
   You should see: `users`, `cities`, `stations`, `vehicles`, `bookings`, `time_slots`

### 2. Configure Database Connection

1. **Edit `config.php` file:**
   ```php
   define('DB_HOST', 'localhost');    // Your MySQL host
   define('DB_USER', 'root');         // Your MySQL username
   define('DB_PASS', '');             // Your MySQL password
   define('DB_NAME', 'onkar_powerstation'); // Database name
   ```

2. **Update these values according to your MySQL setup**

### 4. Web Server Setup

#### For XAMPP/WAMP/MAMP:

1. **Copy the project folder to your web server directory:**
   - XAMPP: `C:\xampp\htdocs\`
   - WAMP: `C:\wamp64\www\`
   - MAMP: `/Applications/MAMP/htdocs/`

2. **Start Apache and MySQL services**

3. **Access the application:**
   ```
   http://localhost/CNG and EV Vehicles/index.html
   ```

#### For Live Server (VS Code):

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"
3. Note: PHP won't work with Live Server - you need a proper PHP server

### 5. Test the Application

1. **Default Test User:**
   - Email: `test@example.com`
   - Password: `test123`

2. **Features to test:**
   - User registration with vehicles
   - Login/Logout
   - Search stations by city
   - Filter stations (All/EV/CNG)
   - Book a station slot
   - View booking history
   - Manage vehicles

## Project Structure

```
CNG and EV Vehicles/
├── index.html          # Main HTML file
├── script.js           # JavaScript with API calls
├── styles.css          # Custom CSS styles
├── config.php          # Database configuration
├── database.sql        # MySQL database schema
├── api/
│   ├── auth.php        # Authentication endpoints
│   ├── vehicles.php    # Vehicle management endpoints
│   ├── stations.php    # Station data endpoints
│   └── bookings.php    # Booking management endpoints
└── README.md           # This file
```

## API Endpoints

### Authentication (`api/auth.php`)
- `GET ?action=check` - Check current session
- `POST ?action=login` - User login
- `POST ?action=register` - User registration
- `POST ?action=logout` - User logout

### Stations (`api/stations.php`)
- `GET ?action=cities` - Get all cities
- `GET ?action=by-city&city=NAME` - Get stations by city
- `GET ?type=EV|CNG` - Get stations by type

### Vehicles (`api/vehicles.php`)
- `GET` - Get user's vehicles
- `POST` - Add new vehicle
- `DELETE ?id=VEHICLE_ID` - Delete vehicle

### Bookings (`api/bookings.php`)
- `GET` - Get user's bookings
- `POST` - Create new booking
- `PUT ?id=BOOKING_ID` - Update booking status

## Database Schema

### Tables:

1. **users** - User accounts
2. **cities** - City information with coordinates
3. **stations** - Charging/filling stations
4. **vehicles** - User vehicles
5. **bookings** - Booking records
6. **time_slots** - Available time slots (for future use)

## Troubleshooting

### Issue: "Connection failed" error
- **Solution:** Check `config.php` database credentials
- Verify MySQL service is running
- Ensure database `onkar_powerstation` exists

### Issue: API calls return 404
- **Solution:** Ensure you're using a PHP-enabled web server (not just file://)
- Check that `api/` folder exists and PHP files are accessible
- Verify Apache/Nginx is configured to process PHP files

### Issue: CORS errors
- **Solution:** The API includes CORS headers. If issues persist, check web server configuration

### Issue: Session not persisting
- **Solution:** Ensure PHP sessions are enabled in `php.ini`
- Check session save path permissions

### Issue: Map not loading
- **Solution:** Verify your Google Maps API key is correct in `index.html`
- Check browser console for API key errors
- Ensure "Maps JavaScript API" is enabled in Google Cloud Console
- Verify API key restrictions allow your domain (if restricted)

## Security Notes

- **Password Hashing:** Uses PHP's `password_hash()` with bcrypt
- **SQL Injection:** All queries use prepared statements
- **Input Validation:** Server-side validation on all inputs
- **Session Management:** PHP sessions for authentication

## Default Data

The database includes:
- 5 cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai)
- 30 stations (6 per city, mix of EV and CNG)
- 1 test user (test@example.com / test123)
- 3 test vehicles for the test user

## Future Enhancements

- Admin panel for station management
- Real-time availability updates
- Payment integration
- Email notifications
- Mobile app API
- Advanced search and filters

## Support

For issues or questions, check:
1. PHP error logs
2. Browser console for JavaScript errors
3. Network tab for API call responses

---

**Note:** This is a development/demo system. For production use, implement additional security measures, error handling, and performance optimizations.
