const Movie = require('../models/Movie');
const List = require('../models/Watchlist');

// Display all movies
exports.getAllMovies = async (req, res) => {
    const search = req.query.search || "";
    let query = {};

    try {
        if (search.trim() !== "") {
            query.title = { $regex: search, $options: "i" }; // case-insensitive
        }

        const movies = await Movie.find(query).sort({ createdAt: -1 });

        res.render('index', {
            movies,
            user: req.session.user || null,
            search
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching movies");
    }
};

// --- DISPLAY SINGLE MOVIE ---
exports.getMovieById = async (req, res) => {
    const { movieId } = req.query;
    try {
        const movie = await Movie.findById(movieId).lean();
        if (!movie) return res.status(404).send("Movie not found");

        let status = null;

        if (req.session && req.session.user) {
            const userId = req.session.user.id || req.session.user._id;
            status = await List.getMovieStatus(userId, movie._id);
        }

        res.render('movie', {
            movie,
            user: req.session.user || null,
            status
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};