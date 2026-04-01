const Movie = require('../models/Movie');

// --- DISPLAY ALL MOVIES ---
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });

        res.render('index', { 
            movies, 
            user: req.session.user || null 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching movies");
    }
};

// --- DISPLAY SINGLE MOVIE ---
exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.query.id);

        if (!movie) {
            return res.status(404).send("Movie not found");
        }

        res.render('movie', { 
            movie, 
            user: req.session.user || null 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};