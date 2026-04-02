// userSchema
// _id: ObjectId
// username: String
// email: String
// password: String
// isAdmin: Boolean
// accountStatus: String ['active', 'suspended', 'disabled']
// watchlistPrivacy: String ['public', 'friends', 'private']
// createdAt: Date
// updatedAt: Date

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must have at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must have at least 6 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        required: [true, 'Role is required'],
        default: 'user'
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'disabled'],
        // suspended: banned by admin/muted (not allowed to add reviews)
        // disabled: user closed account [30 day deletion period]
        default: 'active'
    },
    watchlistPrivacy: { // Watchlist privacy setting: controls who can view the user's watchlist
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
    }
}, { timestamps: true });

// export the schema as a model
module.exports = mongoose.models.User || mongoose.model('User', userSchema);