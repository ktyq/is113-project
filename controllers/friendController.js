// friendController.js
// Controller for bidirectional friend request system:
// - render friends page with 3 sections (Friends, Requests, Recommended)
// - send/accept/decline/block friend requests
// - manage nicknames (only respective user can update theirs)
// - view user profile (changed from friend-watchlist)

const mongoose = require('mongoose');
const User = require('../models/user');
const Friend = require('../models/Friend');

// Resolve user identity from request data (query/body/session fallback)
// For early development where auth is absent, fall back to first user in DB.
// FIX: Guard req.body access — it is undefined if body-parser middleware is missing.
async function resolveCurrentUser(req) {
  if (req.session && req.session.user && req.session.user.id) return req.session.user.id;
  if (req.query && req.query.userId) return req.query.userId;
  if (req.body && req.body.userId) return req.body.userId;
  if (req.user && req.user._id) return req.user._id;

  const firstUser = await User.findOne().sort({ createdAt: 1 });
  if (!firstUser) throw new Error('No users exist in database');
  return firstUser._id;
}

// Cast a value to a Mongoose ObjectId safely.
// Prevents string IDs (from req.query/body) failing $nin/$eq comparisons in queries.
function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

// GET /friends
// Renders the friends page with three sections: Friends, Requests, Recommended
exports.getFriendsPage = async (req, res) => {
  try {
    const userId = await resolveCurrentUser(req);
    const userObjectId = toObjectId(userId);

    // Get all accepted friendships (both directions)
    const friends = await Friend.find({
      $or: [
        { requestor: userObjectId, status: 'accepted' },
        { requestee: userObjectId, status: 'accepted' }
      ]
    }).populate('requestor requestee', 'username _id');

    // Get all pending requests where userId is the requestee
    const requests = await Friend.find({
      requestee: userObjectId,
      status: 'pending'
    }).populate('requestor', 'username _id');

    // Get recommended users (not in any friend relationship)
    const suggestions = await Friend.findSuggestedUsers(userObjectId, 5);

    // Render view with model data
    res.render('friends', {
      currentUserId: userObjectId,
      friends,
      requests,
      suggestions,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/send/:friendId
// Send a friend request from current user to target user
exports.sendRequest = async (req, res) => {
  try {
    const requestor = toObjectId(await resolveCurrentUser(req));
    const requestee = toObjectId(req.params.friendId);

    if (requestor.equals(requestee)) return res.status(400).send('Cannot friend yourself');

    // Check for existing blocked relationship (in either direction)
    const blocked = await Friend.findOne({
      $or: [
        { requestor, requestee, status: 'blocked' },
        { requestor: requestee, requestee: requestor, status: 'blocked' }
      ]
    });
    if (blocked) return res.status(403).send('Cannot send request: blocked or relationship blocked');

    await Friend.sendRequest(requestor, requestee);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/accept/:requestorId
// Accept a friend request (current user is requestee)
exports.acceptRequest = async (req, res) => {
  try {
    const requestee = toObjectId(await resolveCurrentUser(req));
    const requestor = toObjectId(req.params.requestorId);

    // Verify request exists and is pending
    const friendship = await Friend.findOne({ requestor, requestee, status: 'pending' });
    if (!friendship) return res.status(404).send('Request not found');

    await Friend.acceptRequest(requestor, requestee);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/decline/:requestorId
// Decline a friend request (current user is requestee)
exports.declineRequest = async (req, res) => {
  try {
    const requestee = toObjectId(await resolveCurrentUser(req));
    const requestor = toObjectId(req.params.requestorId);

    await Friend.declineRequest(requestor, requestee);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/block/:friendId
// Block a user (prevents further requests)
exports.blockUser = async (req, res) => {
  try {
    const userId = toObjectId(await resolveCurrentUser(req));
    const targetId = toObjectId(req.params.friendId);

    if (userId.equals(targetId)) return res.status(400).send('Cannot block yourself');

    await Friend.blockUser(userId, targetId);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/remove/:friendId
// Remove friend (delete the accepted friendship)
exports.removeFriend = async (req, res) => {
  try {
    const userId = toObjectId(await resolveCurrentUser(req));
    const friendId = toObjectId(req.params.friendId);

    await Friend.removeFriend(userId, friendId);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/nickname/:friendId
// Update nickname for a friend. Only the respective user can update their assigned nickname.
// If current user is requestor, they update nickname2 (for requestee)
// If current user is requestee, they update nickname1 (for requestor)
exports.updateNickname = async (req, res) => {
  try {
    const userId = toObjectId(await resolveCurrentUser(req));
    const friendId = toObjectId(req.params.friendId);
    const newNickname = (req.body && req.body.nickname ? req.body.nickname : '').trim();

    // Find the friendship to determine which nickname field to update
    const friendship = await Friend.findOne({
      $or: [
        { requestor: userId, requestee: friendId, status: 'accepted' },
        { requestor: friendId, requestee: userId, status: 'accepted' }
      ]
    });

    if (!friendship) return res.status(404).send('Friendship not found');

    // Determine which nickname this user can update
    const isNickname1 = friendship.requestee.equals(userId);
    await Friend.updateNickname(userId, friendId, newNickname, isNickname1);

    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// GET /profile/:userId
// View a user's profile page (own or another user's)
exports.viewUserProfile = async (req, res) => {
  try {
    const userId = toObjectId(req.params.userId);
    const currentUserId = toObjectId(await resolveCurrentUser(req));

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    const isOwnProfile = user._id.equals(currentUserId);

    res.render('user-profile', {
      user,
      currentUserId,
      isOwnProfile,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};