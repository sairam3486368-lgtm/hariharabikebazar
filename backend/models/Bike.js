const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    mileage: {
        type: Number,
        required: true
    },
    images: {
        type: [String], // Store Base64 strings for now
        validate: [v => Array.isArray(v) && v.length > 0, 'At least one image is required'],
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bike', bikeSchema);
