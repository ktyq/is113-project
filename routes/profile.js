// routes/profile.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authentication');

// Redirect from root
router.get('/', (req, res) => {
    if (req.session.user) {
        return req.session.user.role === 'admin' || req.session.user.role === 'superadmin'
            ? res.redirect('/profile')
            : res.redirect('/index');
    }
    res.redirect('/index');
});

// Registration
router.get('/register', userController.registerGet);
router.post('/register', userController.registerPost);

// User login
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);

// View user profile
router.get('/profile', authMiddleware.isLoggedIn, userController.profile);

// Editing user profile
router.get('/edit-profile', authMiddleware.isLoggedIn, userController.editProfileGet);
router.post('/edit-profile', authMiddleware.isLoggedIn, userController.editProfilePost);

// Delete user profile
router.post('/delete-profile', authMiddleware.isLoggedIn, userController.deleteProfile);

// Log out
router.post('/logout', userController.logout);

// Superadmin
router.get('/manage-accounts', authMiddleware.isAdmin, userController.manageAccountsGet);
router.post('/manage-accounts/promote', authMiddleware.isAdmin, userController.promoteToAdmin);
router.post('/manage-accounts/demote', authMiddleware.isAdmin, userController.demoteToUser);

module.exports = router;