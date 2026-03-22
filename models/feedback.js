// user_id
// problem_message
// status


const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: [true, 'User is required']
    },
    problemMessage: {
        type: String,
        required: true,
        // unique: true
    },
    status: {
        type: Boolean,
        required: false,
    },
}, {timestamps: true});

module.exports = mongoose.model('Feedback', feedbackSchema)