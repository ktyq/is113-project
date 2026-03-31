const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/authentication');

// Protect all admin routes
router.use(authMiddleware.isAdmin);

// CREATE
router.post('/add', movieController.createMovie);

// READ (Admin view)
router.get('/', movieController.getAllMoviesAdmin);

// DELETE
router.get('/delete/:id', movieController.deleteMovie);

// EDIT FORM
router.get('/edit/:id', movieController.getEditMovie);

// UPDATE
router.post('/edit/:id', movieController.updateMovie);

module.exports = router;