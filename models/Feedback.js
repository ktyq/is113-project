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
    // type of form (feedback, bug report, user report)
    type: {
        type: String,
        enum: ['feedback', 'bug', 'report']
    },

    // status of the form (pending review, working on it, resolved)
    status: {
        type: String,
        enum: ['pending', 'resolved']
    },
    url: {
        type: String
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