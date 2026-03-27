// movieSchema
// _id: ObjectId
// title: String
// imageRef: String 
// movieLength: Number [minutes] 
// releaseYear: String 
// genre: [String]
// overview: String
// director: [String]
// cast: [String]
// addedBy: ObjectId
// createdAt: Date
// updatedAt: Date

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    imageRef: {
        type: String,
        required: true
    },
    movieLength: {
        type: Number,
        required: true
    },
    release_year: {
        type: Number,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    director: {
        type: [String],
        required: true
    },
    cast: {
        type: [String],
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
