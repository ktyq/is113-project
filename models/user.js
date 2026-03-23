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
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: [{
        type: Boolean,
        required: true,
        default: false
    }],
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'disabled'],
        // suspended: banned by dmin/muted (not allowed to add reviews)
        // disabled: user closed account [30 day deletion period]
        default: 'active'
    }
}, { timestamps: true });

// todo methods
