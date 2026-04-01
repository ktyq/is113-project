const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/authentication');
const multer = require('multer');
const path = require('path');

//configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Protect all admin routes
router.use(authMiddleware.isAdmin);

// --- ADMIN DASHBOARD ---
router.get('/', movieController.getAllMoviesAdmin);

// --- ADD MOVIE ---
router.post('/add', upload.single('image'), movieController.createMovie);

// --- EDIT MOVIE FORM ---
router.get('/edit', movieController.getEditMovie);

// --- UPDATE MOVIE ---
router.post('/edit', upload.single('image'), movieController.updateMovie);

// --- DELETE MOVIE ---
router.get('/delete', movieController.deleteMovie);

module.exports = router;