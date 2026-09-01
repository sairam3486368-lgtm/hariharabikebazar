require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Bike = require('./models/Bike');
const Admin = require('./models/Admin');

const app = express();

// Increase JSON payload limit because Base64 images can be large
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

// --- Routes ---

// --- Authentication Routes ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newAdmin = new Admin({ username, password });
        await newAdmin.save();
        
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: 'Error creating admin' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.json({ message: 'Login successful', username: admin.username });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// --- Bike Routes ---

// Get all bikes
app.get('/api/bikes', async (req, res) => {
    try {
        const bikes = await Bike.find().sort({ uploadDate: -1 });
        res.json(bikes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new bike
app.post('/api/bikes', async (req, res) => {
    try {
        const newBike = new Bike(req.body);
        const savedBike = await newBike.save();
        res.status(201).json(savedBike);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Edit a bike
app.put('/api/bikes/:id', async (req, res) => {
    try {
        const updatedBike = await Bike.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBike) return res.status(404).json({ error: 'Bike not found' });
        res.json(updatedBike);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a bike
app.delete('/api/bikes/:id', async (req, res) => {
    try {
        const deletedBike = await Bike.findByIdAndDelete(req.params.id);
        if (!deletedBike) return res.status(404).json({ error: 'Bike not found' });
        res.json({ message: 'Bike deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
