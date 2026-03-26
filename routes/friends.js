const express = require('express');
const friendController = require('../controllers/friendController');
const router = express.Router();

// Instant page render for user friends
router.get('/', friendController.getFriendsPage);

// Add friend
router.post('/add/:friendId', friendController.addFriend);

// Per-friend form actions
router.post('/remove/:friendId', friendController.removeFriend);
router.post('/nickname/:friendId', friendController.updateNickname);

// Friend watchlist page
router.get('/watchlist/:friendId', friendController.viewFriendWatchlist);

module.exports = router;
