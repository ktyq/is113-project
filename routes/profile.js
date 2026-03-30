// Profile (hazel)
// C: 
// R: 
// U: Update profile
// D: delete profile
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authentication');

//--Root redirect--//
router.get('/', (req, res) => {
    if (req.session.user) {
        return req.session.user.role === 'admin'
        ? res.redirect('/admin-profile')
        : res.redirect('/user-profile');
    }
    res.redirect('/login');
})

router.get('/register', userController.registerGet);
router.post('/register', userController.registerPost);

router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);

//--User profile--//
router.get('/user-profile', authMiddleware.isLoggedIn, userController.profile);

//--Admin profile--//
router.get('/admin-profile', authMiddleware.isAdmin, userController.adminProfile);

//--Edit profile--//
router.get('/edit-profile', authMiddleware.isLoggedIn, userController.editProfileGet);
router.post('/edit-profile', authMiddleware.isLoggedIn, userController.editProfilePost);

//--Delete profile--//
router.post('/delete-profile', authMiddleware.isLoggedIn, userController.deleteProfile);

//--Logout--//
router.post('/logout', userController.logout);

module.exports = router;