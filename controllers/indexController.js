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
    const movieId = req.query.id;
    const movie = await Movie.findById(movieId).lean();

    let status = null;

    if (req.session.user) {
      // Use listController.getMovieStatus logic directly
      const watchItem = await List.findOne({
        userID: req.session.user._id,
        movieID: movieId
      }).lean();

      if (watchItem) {
        status = watchItem.status; // 'planning' or 'watched'
      }
    }

    res.render('movie', {
      movie,
      user: req.session.user || null,
      status // null if not in watchlist
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};