const Movie = require('../models/Movie');
const listController = require('./listController');

// --- CREATE MOVIE ---
exports.createMovie = async (req, res) => {
    const { title, movieLength, release_year, genre, overview, director, cast } = req.body;
    try {

        // check req.file instead of imageRef
        if (!title || !movieLength || !release_year || !genre || !overview || !director || !cast || !req.file) {
            return res.send("All fields are required!");
        }

        await Movie.create({
            title,
            imageRef: '/uploads/' + req.file.filename, // ✅ from multer
            movieLength: Number(movieLength),
            release_year: Number(release_year),
            genre: genre.split(',').map(g => g.trim()),
            overview,
            director: director.split(',').map(d => d.trim()),
            cast: cast.split(',').map(c => c.trim()),
            addedBy: req.session.user.id
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
        const search = req.query.search || "";

        let query = {};

        if (search.trim() !== "") {
            query.title = { $regex: search, $options: "i" };
        }

        const movies = await Movie.find(query).sort({ createdAt: -1 });

        res.render('admin', {
            movies,
            search,
            user: req.session.user
        });

    } catch (err) {
        console.error(err);
        res.send("Error fetching movies");
    }
};

// --- DELETE MOVIE ---
exports.deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.query.id);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.send("Error deleting movie");
    }
};

// --- SHOW EDIT FORM ---
exports.getEditMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.query.id);
        if (!movie) return res.send("Movie not found");

        res.render('editMovie', {
            movie,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading edit page");
    }
};

// --- UPDATE MOVIE ---
exports.updateMovie = async (req, res) => {
    try {
        const { title, movieLength, release_year, genre, overview, director, cast } = req.body;

        // ✅ Validation
        if (!title || !movieLength || !release_year || !genre || !overview || !director || !cast) {
            return res.send("All fields are required!");
        }

        // ✅ Prepare updated data
        let updatedData = {
            title,
            movieLength: Number(movieLength),
            release_year: Number(release_year),
            genre: genre.split(',').map(g => g.trim()),
            overview,
            director: director.split(',').map(d => d.trim()),
            cast: cast.split(',').map(c => c.trim()),
            updatedAt: new Date()
        };

        // ✅ If new image uploaded → update imageRef
        if (req.file) {
            updatedData.imageRef = '/uploads/' + req.file.filename;
        }

        // ✅ Update in DB
        await Movie.findByIdAndUpdate(req.query.id, updatedData);

        // ✅ Redirect back to admin page
        res.redirect('/admin');

    } catch (err) {
        console.error(err);
        res.send("Error updating movie");
    }
};