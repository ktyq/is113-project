// routes/friends.js
const express = require('express');
const friendController = require('../controllers/friendController');
const router = express.Router();

// Friends page with all sections (Friends, Sent Requests, Received Requests, Recommended)
router.get('/', friendController.getFriendsPage);

// Browse all users with search, sort, and pagination
router.get('/browse', friendController.browseUsers);

// Send friend request
router.post('/send/:friendId', friendController.sendRequest);

// Cancel a sent pending request (deletes the entry)
router.post('/cancel/:requesteeId', friendController.cancelRequest);

// Accept friend request (current user is requestee)
router.post('/accept/:requestorId', friendController.acceptRequest);

// Decline friend request (deletes the entry, current user is requestee)
router.post('/decline/:requestorId', friendController.declineRequest);

// Remove friend (delete accepted friendship)
router.post('/remove/:friendId', friendController.removeFriend);

// Update nickname (only respective user can update theirs)
router.post('/nickname/:friendId', friendController.updateNickname);

// View user profile
router.get('/profile/:userId', friendController.viewUserProfile);

module.exports = router;