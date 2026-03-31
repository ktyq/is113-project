const express = require('express');
const friendController = require('../controllers/friendController');
const router = express.Router();

// Friends page with all three sections (Friends, Requests, Recommended)
router.get('/', friendController.getFriendsPage);

// Send friend request
router.post('/send/:friendId', friendController.sendRequest);

// Accept friend request (current user is requestee)
router.post('/accept/:requestorId', friendController.acceptRequest);

// Decline friend request (current user is requestee)
router.post('/decline/:requestorId', friendController.declineRequest);

// Block a user
router.post('/block/:friendId', friendController.blockUser);

// Remove friend (delete accepted friendship)
router.post('/remove/:friendId', friendController.removeFriend);

// Update nickname (only respective user can update theirs)
router.post('/nickname/:friendId', friendController.updateNickname);

// View user profile
router.get('/profile/:userId', friendController.viewUserProfile);

module.exports = router;
