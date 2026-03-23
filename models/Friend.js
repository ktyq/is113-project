// friendSchema
// _id: ObjectId
// requester: String
// recipient: String
// status: String ['pending', 'accepted', 'declined', 'blocked']
// createdAt: Date (date added as friends)
// updatedAt: Date

const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'blocked'],
        required: true
    },
}, { timestamps: true });

// todo methods
