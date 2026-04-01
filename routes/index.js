const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const authMiddleware = require('../middleware/authentication');

// --- DISPLAY ALL MOVIES --- this one is for index page
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.render('index', { movies, user: req.session.user || null });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching movies");
    }
});

// --- DISPLAY SINGLE MOVIE --- this one is for movie page
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send("Movie not found");

        res.render('movie', { movie, user: req.session.user || null });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;