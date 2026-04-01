const Movie = require('../models/Movie');
const listController = require('./listController');
const List = require('../models/Watchlist');

// --- DISPLAY ALL MOVIES ---
exports.getAllMovies = async (req, res) => {
    try {
        const search = req.query.search || "";

        let query = {};

        if (search.trim() !== "") {
            query.title = { $regex: search, $options: "i" }; // case-insensitive
        }

        const movies = await Movie.find(query).sort({ createdAt: -1 });

        res.render('index', { 
            movies, 
            user: req.session.user || null,
            search // pass back to frontend
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching movies");
    }
};

// --- DISPLAY SINGLE MOVIE ---
exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.query.id).lean();
        if (!movie) return res.status(404).send("Movie not found");

        let status = null;

        if (req.session && req.session.user) {
            const userId = req.session.user.id || req.session.user._id;

            // ✅ THIS IS YOUR getMovieStatus
            status = await List.getMovieStatus(userId, movie._id);
        }

        res.render('movie', {
            movie,
            user: req.session.user || null,
            status   // ✅ PASS TO EJS
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};