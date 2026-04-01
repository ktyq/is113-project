const Movie = require('../models/movie');
const mongoose = require('mongoose');

// --- CREATE MOVIE ---
exports.createMovie = async (req, res) => {
    try {
        const { title, imageRef, movieLength, release_year, genre, overview, director, cast } = req.body;

        if (!title || !imageRef || !movieLength || !release_year || !genre || !overview || !director || !cast) {
            return res.send("All fields are required!");
        }

        await Movie.create({
            title,
            imageRef,
            movieLength: Number(movieLength),
            release_year: Number(release_year),
            genre: genre.split(',').map(g => g.trim()),
            overview,
            director: director.split(',').map(d => d.trim()),
            cast: cast.split(',').map(c => c.trim()),
            addedBy: new mongoose.Types.ObjectId()
        });

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.send("Error creating movie");
    }
};

// --- READ MOVIES ---
exports.getAllMoviesAdmin = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.render('admin', { movies });
    } catch (err) {
        console.error(err);
        res.send("Error fetching movies");
    }
};

// --- DELETE MOVIE ---
exports.deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.send("Error deleting movie");
    }
};

// --- SHOW EDIT FORM ---
exports.getEditMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.send("Movie not found");

        res.render('editMovie', { movie });
    } catch (err) {
        console.error(err);
        res.send("Error loading edit page");
    }
};

// --- UPDATE MOVIE ---
exports.updateMovie = async (req, res) => {
    try {
        const { title, imageRef, movieLength, release_year, genre, overview, director, cast } = req.body;

        if (!title || !imageRef || !movieLength || !release_year || !genre || !overview || !director || !cast) {
            return res.send("All fields are required!");
        }

        await Movie.findByIdAndUpdate(req.params.id, {
            title,
            imageRef,
            movieLength: Number(movieLength),
            release_year: Number(release_year),
            genre: genre.split(',').map(g => g.trim()),
            overview,
            director: director.split(',').map(d => d.trim()),
            cast: cast.split(',').map(c => c.trim()),
            updatedAt: new Date()
        });

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.send("Error updating movie");
    }
};