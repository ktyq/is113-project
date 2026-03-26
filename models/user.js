// userSchema
// _id: ObjectId
// username: String
// email: String
// password: String
// isAdmin: Boolean
// accountStatus: String ['active', 'suspended', 'disabled']
// createdAt: Date
// updatedAt: Date

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'disabled'],
        // suspended: banned by dmin/muted (not allowed to add reviews)
        // disabled: user closed account [30 day deletion period]
        default: 'active'
    }
}, { timestamps: true });

// models/User.js
module.exports = mongoose.models.User || mongoose.model('User', userSchema);