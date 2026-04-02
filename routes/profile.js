// routes/profile.js - hazel
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authentication');

//--Root redirect--//
router.get('/', (req, res) => {
    if (req.session.user) {
        return req.session.user.role === 'admin' || req.session.user.role === 'superadmin'
        ? res.redirect('/admin-profile')
        : res.redirect('/index');
    }
    res.redirect('/index');
})

router.get('/register', userController.registerGet);
router.post('/register', userController.registerPost);

router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);

//--User profile--//
router.get('/profile', authMiddleware.isLoggedIn, userController.profile);

//--Edit profile--//
router.get('/edit-profile', authMiddleware.isLoggedIn, userController.editProfileGet);
router.post('/edit-profile', authMiddleware.isLoggedIn, userController.editProfilePost);

//--Delete profile--//
router.post('/delete-profile', authMiddleware.isLoggedIn, userController.deleteProfile);

//--Logout--//
router.post('/logout', userController.logout);

//--Superadmin--//
router.get('/manage-accounts', authMiddleware.isAdmin, userController.manageAccountsGet);
router.post('/manage-accounts/promote', authMiddleware.isAdmin, userController.promoteToAdmin);
router.post('/manage-accounts/demote', authMiddleware.isAdmin, userController.demoteToUser);

module.exports = router;