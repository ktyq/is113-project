const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const authMiddleware = require('../middleware/authentication');

// --- DISPLAY ALL MOVIES ---
router.get('/', indexController.getAllMovies);

// --- DISPLAY SINGLE MOVIE ---
router.get('/view', indexController.getMovieById);

module.exports = router;