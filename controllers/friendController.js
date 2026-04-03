// friendController.js
// Controller for bidirectional friend request system:
// - render friends page with 4 sections (Friends, Sent Requests, Received Requests, Recommended)
// - send/accept/decline/cancel friend requests
// - manage nicknames (only respective user can update theirs)
// - view user profile
// - browse all users with search, sort, and pagination

const mongoose = require('mongoose');
const User = require('../models/User');
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
function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

// GET /friends
exports.getFriendsPage = async (req, res) => {
  try {
    const userId = await resolveCurrentUser(req);
    const userObjectId = toObjectId(userId);

    const user = await User.findById(userObjectId);
    if (!user) return res.status(404).send('User not found');

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

    const sentRequests = await Friend.find({
      requestor: userObjectId,
      status: 'pending'
    }).populate('requestee', 'username _id');

    const suggestions = await Friend.findSuggestedUsers(userObjectId, 5);

    res.render('friends', {
      user,
      currentUserId: userObjectId,
      friends,
      requests,
      sentRequests,
      suggestions,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// GET /friends/browse
exports.browseUsers = async (req, res) => {
  try {
    const userId = await resolveCurrentUser(req);
    const userObjectId = toObjectId(userId);

    const user = await User.findById(userObjectId);
    if (!user) return res.status(404).send('User not found');

    const search = (req.query.search || '').trim();
    const sort = req.query.sort || 'az';
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const allRelationships = await Friend.find({
      $or: [
        { requestor: userObjectId },
        { requestee: userObjectId }
      ]
    });

    const excludedIds = new Set([userObjectId.toString()]);
    for (const r of allRelationships) {
      const otherId = r.requestor.equals(userObjectId)
        ? r.requestee.toString()
        : r.requestor.toString();
      excludedIds.add(otherId);
    }
    const excludedObjectIds = [...excludedIds].map(id => toObjectId(id));

    const filter = {
      _id: { $nin: excludedObjectIds },
      ...(search && { username: { $regex: search, $options: 'i' } }),
    };

    const sortMap = {
      az:     { username:  1 },
      za:     { username: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt:  1 },
    };
    const sortQuery = sortMap[sort] || sortMap.az;

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalUsers / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const users = await User.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select('username createdAt _id');

    const queryString = new URLSearchParams({
      ...(search && { search }),
      sort,
      limit,
      page: safePage,
    }).toString();

    res.render('browse-users', {
      user,
      currentUserId: userObjectId,
      users,
      search,
      sort,
      limit,
      page: safePage,
      totalPages,
      totalUsers,
      queryString: queryString ? `&${queryString}` : '',
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/send
// friendId read from req.body
exports.sendRequest = async (req, res) => {
  try {
    const requestor = toObjectId(await resolveCurrentUser(req));
    const requestee = toObjectId(req.body.friendId);
console.log(requestor, requestee, "t")
    if (requestor.equals(requestee)) return res.status(400).send('Cannot friend yourself');

    const reverseRequest = await Friend.findOne({
      requestor: requestee,
      requestee: requestor,
      status: 'pending'
    });
    
    if (reverseRequest) {
      return res.redirect(req.query.redirect || '/friends');
    }

    await Friend.sendRequest(requestor, requestee);
    res.redirect(req.query.redirect || '/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/cancel
// requesteeId read from req.body
exports.cancelRequest = async (req, res) => {
  try {
    const requestor = toObjectId(await resolveCurrentUser(req));
    const requestee = toObjectId(req.body.requesteeId);

    await Friend.cancelRequest(requestor, requestee);
    res.redirect(req.query.redirect || '/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/accept
// requestorId read from req.body
exports.acceptRequest = async (req, res) => {
  try {
    const requestee = toObjectId(await resolveCurrentUser(req));
    const requestor = toObjectId(req.body.requestorId);

    const friendship = await Friend.findOne({ requestor, requestee, status: 'pending' });
    if (!friendship) return res.status(404).send('Request not found');

    await Friend.acceptRequest(requestor, requestee);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/decline
// requestorId read from req.body
exports.declineRequest = async (req, res) => {
  try {
    const requestee = toObjectId(await resolveCurrentUser(req));
    const requestor = toObjectId(req.body.requestorId);

    await Friend.declineRequest(requestor, requestee);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/remove
// friendId read from req.body
exports.removeFriend = async (req, res) => {
  try {
    const userId = toObjectId(await resolveCurrentUser(req));
    const friendId = toObjectId(req.body.friendId);

    await Friend.removeFriend(userId, friendId);
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/nickname
// friendId and nickname read from req.body
exports.updateNickname = async (req, res) => {
  try {
    const userId = toObjectId(await resolveCurrentUser(req));
    const friendId = toObjectId(req.body.friendId);
    const newNickname = (req.body.nickname || '').trim();

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

