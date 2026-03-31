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

// Define the schema for feedback, bug/general reports
const formSchema = new mongoose.Schema({
    //who submitted the feedback (required)
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',            // references the User collection
        required: [true, 'User is required']
    },

    // if the form is abt a movie bug, store reference to the movie (optional)
    movieID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: false
    },

    // if the form is abt a review, store reference to the review (optional)
    ReviewID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: false
    },

    // if the form is abt a user, store reference to the user (optional)
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    // type of form (feedback, bug report, user report)
    type: {
        type: String,
        enum: ['feedback', 'bug', 'report']
    },

    // status of the form (pending review, working on it, resolved)
    status: {
        type: String,
        enum: ['pending', 'working', 'resolved']
    },

    // additional notes by admin when working on the form
    notes: {
        type: String,
        maxLength: 256
    },
},
    { timestamps: true } // automatically adds createdAt and updatedAt fields
);

// export the schema as a model
module.exports = mongoose.model('Feedback', formSchema);