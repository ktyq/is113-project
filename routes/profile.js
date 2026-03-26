// Profile (ryan)
// C: 
// R: 
// U: Update profile
// D: delete profile
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userConstroller');
const authMiddleware = require('../middleware/authentication');

//--Root redirect--//
router.get('/', (req, res) => {
    if (req.session.user) {
        return req.session.user.role === 'admin'
        ? req.redirect('/admin-profile')
        : req.redirect('/user-profile');
    }
    res.redirect('/login');
})

router.get('/register', userController.registerGet);
router.post('/register', userController.registerPost);

router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);