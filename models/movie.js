// MOVIE
// - movie_id
// - title 
// - image_ref
// - movie_length
// - release_year
// - genre
// - overview
// - {director(s)}
// - {cast(s)}
// - created_by
// - created_at
// - modified_at
// - [average_rating]

// DUMMY TABLE
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    timestamps: true
});

// todo methods