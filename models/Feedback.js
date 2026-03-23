// formSchema
// _id: ObjectId
// sentBy: ObjectId
// movieID: ObjectId (optional, report movie bug)
// userID: ObjectId (optional, report user)
// reviewID: ObjectId (optional, report review)
// type: String ['feedback', 'bug', 'report']
// status: String ['pending', 'working', 'resolved'] (pending review, working on it)
// notes: String [max: 256]
// createdAt: Date
// updatedAt: Date

const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    movieID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: false
    },
    ReviewID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: false
    },
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    type: {
        type: String,
        enum: ['feedback', 'bug', 'report']
    },
    status: {
        type: String,
        enum: ['pending', 'working', 'resolved']
    },
    notes: {
        type: String,
        maxLength: 256
    },
},
    { timestamps: true }
);
