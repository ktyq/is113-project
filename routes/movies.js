const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/authentication');

// Protect all admin routes
router.use(authMiddleware.isAdmin);

// --- ADMIN DASHBOARD: LIST ALL MOVIES ---
router.get('/', movieController.getAllMoviesAdmin);

// --- ADD MOVIE ---
router.post('/add', movieController.createMovie);

// --- EDIT MOVIE FORM ---
router.get('/edit/:id', movieController.getEditMovie);

// --- UPDATE MOVIE ---
router.post('/edit/:id', movieController.updateMovie);

// --- DELETE MOVIE ---
router.get('/delete/:id', movieController.deleteMovie);

module.exports = router;