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
// FIX: session.user is an object {id, username, email, role} - extract .id safely
async function resolveCurrentUser(req) {
  if (req.session && req.session.user) {
    const sid = req.session.user.id || req.session.user._id;
    if (sid) return typeof sid === 'object' ? sid.toString() : sid;
  }
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

    const friends = await Friend.find({
      $or: [
        { requestor: userObjectId, status: 'accepted' },
        { requestee: userObjectId, status: 'accepted' }
      ]
    }).populate('requestor requestee', 'username _id');

    const requests = await Friend.find({
      requestee: userObjectId,
      status: 'pending'
    }).populate('requestor', 'username _id');

    const suggestions = await Friend.findSuggestedUsers(userObjectId, 5);

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
exports.sendRequest = async (req, res) => {
  try {
    const requestor = toObjectId(await resolveCurrentUser(req));
    const requestee = toObjectId(req.params.friendId);

    if (requestor.equals(requestee)) return res.status(400).send('Cannot friend yourself');

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
exports.acceptRequest = async (req, res) => {
  try {
    const requestee = toObjectId(await resolveCurrentUser(req));
    const requestor = toObjectId(req.params.requestorId);

    const friendship = await Friend.findOne({ requestor, requestee, status: 'pending' });
    if (!friendship) return res.status(404).send('Request not found');

    await Friend.acceptRequest(requestor, requestee);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/decline/:requestorId
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
exports.updateNickname = async (req, res) => {
  try {
    const userId = toObjectId(await resolveCurrentUser(req));
    const friendId = toObjectId(req.params.friendId);
    const newNickname = (req.body && req.body.nickname ? req.body.nickname : '').trim();

    const friendship = await Friend.findOne({
      $or: [
        { requestor: userId, requestee: friendId, status: 'accepted' },
        { requestor: friendId, requestee: userId, status: 'accepted' }
      ]
    });

    if (!friendship) return res.status(404).send('Friendship not found');

    const isNickname1 = friendship.requestee.equals(userId);
    await Friend.updateNickname(userId, friendId, newNickname, isNickname1);

    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// GET /profile/:userId
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