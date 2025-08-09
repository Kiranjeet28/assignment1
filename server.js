require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('MySQL connected...');
});

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Add School API
app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  
  // Validation
  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid input. All fields are required and coordinates must be numbers.' });
  }
  
  // Check for valid latitude and longitude ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180' });
  }
  
  db.query(
    'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
    [name, address, parseFloat(latitude), parseFloat(longitude)],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ 
        message: 'School added successfully', 
        id: result.insertId,
        school: { id: result.insertId, name, address, latitude, longitude }
      });
    }
  );
});

// List Schools API
app.get('/listSchools', (req, res) => {
  const { latitude, longitude } = req.query;
  
  // Validation
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Valid latitude and longitude query parameters are required' });
  }
  
  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);
  
  // Check for valid latitude and longitude ranges
  if (userLat < -90 || userLat > 90 || userLon < -180 || userLon > 180) {
    return res.status(400).json({ error: 'Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180' });
  }
  
  db.query('SELECT * FROM schools', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.json({ message: 'No schools found', schools: [] });
    }
    
    const sorted = results.map(school => {
      const distance = calculateDistance(userLat, userLon, school.latitude, school.longitude);
      return { 
        ...school, 
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    }).sort((a, b) => a.distance - b.distance);
    
    res.json({
      message: 'Schools retrieved successfully',
      userLocation: { latitude: userLat, longitude: userLon },
      schools: sorted
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});