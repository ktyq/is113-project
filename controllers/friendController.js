// friendController.js
// Controller for friend / follow list behavior:
// - render friends page
// - add/remove friend (following)
// - change nickname for a friend
// - view friend's watchlist

const User = require('../models/User');
const Friend = require('../models/Friend');

// Resolve user identity from request data (query/body/session fallback)
// For early development where auth is absent, fall back to first user in DB.
async function resolveCurrentUser(req) {
  if (req.query.userId) return req.query.userId;
  if (req.body.userId) return req.body.userId;
  if (req.user && req.user._id) return req.user._id;

  const firstUser = await User.findOne().sort({ createdAt: 1 });
  if (!firstUser) throw new Error('No users exist in database');
  return firstUser._id;
}

// GET /friends
// Renders the page with existing follows + suggestions
exports.getFriendsPage = async (req, res) => {
  try {
    const userId = await resolveCurrentUser(req);

    // Get list of users this owner is following
    const friends = await Friend.find({ owner: userId, status: 'following' }).populate('friend', 'username nickname');

    // Build exclusion list for suggestions: self + existing follows
    const existingFriendIds = friends.map(f => f.friend._id);
    const exclusions = [userId, ...existingFriendIds];

    // Suggestions: random 5 users not already followed
    const suggestions = await User.aggregate([
      { $match: { _id: { $nin: exclusions } } },
      { $sample: { size: 5 } },
      { $project: { username: 1 } },
    ]);

    // Render view with model data
    res.render('friends', {
      currentUserId: userId,
      friends,
      suggestions,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /friends/add/:friendId
// Follow a user (add friend). If already followed, do nothing.
exports.addFriend = async (req, res) => {
  try {
    const owner = await resolveCurrentUser(req);
    const friendId = req.params.friendId;

    if (!friendId) return res.status(400).send('friendId required');

    // Upsert following record
    const existing = await Friend.findOne({ owner, friend: friendId, status: 'following' });
    if (!existing) {
      await Friend.create({ owner, friend: friendId, status: 'following', nickname: '' });
    }

    // Redirect to refresh friends page
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};


// POST /friends/remove/:friendId
// Unfollow user (remove friend relationship)
exports.removeFriend = async (req, res) => {
  try {
    const owner = await resolveCurrentUser(req);
    const friendId = req.params.friendId;

    await Friend.deleteOne({ owner, friend: friendId, status: 'following' });

    // Reload to show updates
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};


// POST /friends/nickname/:friendId
// Update nickname for an existing follow entry. Client-side input comes from form value.
exports.updateNickname = async (req, res) => {
  try {
    const owner = await resolveCurrentUser(req);
    const friendId = req.params.friendId;
    const newNickname = (req.body.nickname || '').trim();

    await Friend.updateOne(
      { owner, friend: friendId, status: 'following' },
      { nickname: newNickname }
    );

    // Refresh view after update
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};


// GET /watchlist/:friendId
// Ensure only followed friends can be viewed.
exports.viewFriendWatchlist = async (req, res) => {
  try {
    const ownerId = await resolveCurrentUser(req);
    const friendId = req.params.friendId;

    // Confirm page being requested exists as a user
    const friend = await User.findById(friendId, 'username');
    if (!friend) return res.status(404).send('Friend not found');

    // Authorize by friend relationship
    const friendship = await Friend.findOne({ owner: ownerId, friend: friendId, status: 'following' });
    if (!friendship) return res.status(403).send('Forbidden: you do not follow this user');

    res.render('friend-watchlist', {
      friend,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
