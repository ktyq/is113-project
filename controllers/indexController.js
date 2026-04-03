// controllers/indexController.js
const Movie = require('../models/Movie');
const List = require('../models/Watchlist');
const Review = require('../models/Review');

// Display all movies
exports.getAllMovies = async (req, res) => {
    const search = req.query.search || "";
    let query = {};

    try {
        if (search.trim() !== "") {
            query.title = { $regex: search, $options: "i" }; // case-insensitive
        }

        const movies = await Movie.find(query).sort({ createdAt: -1 }).lean();

        for (let movie of movies) {
            const reviews = await Review.find({ movieID: movie._id });

            if (reviews.length === 0) {
                movie.averageRating = null;
            } else {
                const total = reviews.reduce((sum, r) => sum + r.rating, 0);
                movie.averageRating = (total / reviews.length).toFixed(1);
            }
        }

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

        const reviewCount = await Review.countDocuments({ movieID: movie._id });

        const reviews = await Review.find({ movieID: movie._id })
        .populate("userID", "username")
        .sort({ createdAt: -1 });

        if (reviews.length === 0) {
            movie.averageRating = null;
        } else {
            const total = reviews.reduce((sum, r) => sum + r.rating, 0);
            movie.averageRating = (total / reviews.length).toFixed(1);
        }
        res.render('movie', {
            movie,
            user: req.session.user || null,
            status,
            reviewCount,
            reviews   // pass to EJS
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};