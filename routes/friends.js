// routes/friends.js
const express = require('express');
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/authentication');
const router = express.Router();
router.use(authMiddleware.isLoggedIn)

// Friends page with all sections (Friends, Sent Requests, Received Requests, Recommended)
router.get('/', friendController.getFriendsPage);

// Browse all users who are not friends or pending requests, with search and sorting
router.get('/browse', friendController.browseUsers);

// Send friend request
router.post('/send', friendController.sendRequest);

// Cancel a sent pending request
router.post('/cancel', friendController.cancelRequest);

// Accept friend request
router.post('/accept', friendController.acceptRequest);

// Decline friend request
router.post('/decline', friendController.declineRequest);

// Remove friend 
router.post('/remove', friendController.removeFriend);

// Update nickname
router.post('/nickname', friendController.updateNickname);

module.exports = router;