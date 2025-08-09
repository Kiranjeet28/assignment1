# School Management API

A Node.js REST API for managing schools with location-based sorting functionality.

## 🚀 Live Demo
- **API Base URL:** https://your-app.up.railway.app
- **Postman Documentation:** https://documenter.getpostman.com/view/your-collection-id

## 🛠️ Features
- Add new schools with validation
- List schools sorted by distance from user location
- Geographic distance calculation using Haversine formula
- Comprehensive input validation
- Error handling

## 📋 API Endpoints

### Add School
- **Endpoint:** `POST /addSchool`
- **Body:** `{ name, address, latitude, longitude }`
- **Response:** School added with generated ID

### List Schools
- **Endpoint:** `GET /listSchools`
- **Parameters:** `latitude, longitude`
- **Response:** Schools sorted by distance

## 🗄️ Database Schema
```sql
CREATE TABLE schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude FLOAT(10, 6) NOT NULL,
    longitude FLOAT(10, 6) NOT NULL
);