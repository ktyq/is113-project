// formSchema
// _id: ObjectId
// sentBy: ObjectId
// type: String ['feedback', 'bug', 'report']
// status: String ['pending', 'resolved'] 
// url: String
// notes: String [max: 256]
// createdAt: Date
// updatedAt: Date

const mongoose = require('mongoose');

// Define the schema for feedback, bug/general reports
const formSchema = new mongoose.Schema({
    sentBy: { // who submitted the feedback (required)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',            // references the User collection
        required: [true, 'User is required']
    },
    type: { // type of form 
        type: String,
        enum: ['feedback', 'bug']
    },
    status: { // status of the form
        type: String,
        enum: ['pending', 'resolved'] //  (pending review, resolved)
    },
    url: {
        type: String
    },
    notes: { // feedback comments
        type: String,
        maxLength: 256
    },
},
    { timestamps: true } // automatically adds createdAt and updatedAt fields
);

// export the schema as a model
module.exports = mongoose.model('Feedback', formSchema);