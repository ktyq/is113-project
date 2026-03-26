const User = require('../models/user');
const Friend = require('../models/Friend');

async function resolveCurrentUser(req) {
  if (req.query.userId) return req.query.userId;
  if (req.body.userId) return req.body.userId;
  if (req.user && req.user._id) return req.user._id;

  const firstUser = await User.findOne().sort({ createdAt: 1 });
  if (!firstUser) throw new Error('No users exist in database');
  return firstUser._id;
}

exports.getFriendsPage = async (req, res) => {
  try {
    const userId = await resolveCurrentUser(req);
    const friends = await Friend.find({ owner: userId, status: 'following' }).populate('friend', 'username nickname');
    const existingFriendIds = friends.map(f => f.friend._id);
    const exclusions = [userId, ...existingFriendIds];

    const suggestions = await User.aggregate([
      { $match: { _id: { $nin: exclusions } } },
      { $sample: { size: 5 } },
      { $project: { username: 1 } },
    ]);

    res.render('friends', {
      currentUserId: userId,
      friends,
      suggestions,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.addFriend = async (req, res) => {
  try {
    const owner = await resolveCurrentUser(req);
    const friendId = req.params.friendId;

    if (!friendId) return res.status(400).send('friendId required');

    const existing = await Friend.findOne({ owner, friend: friendId, status: 'following' });
    if (!existing) {
      await Friend.create({ owner, friend: friendId, status: 'following', nickname: '' });
    }

    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const owner = await resolveCurrentUser(req);
    const friendId = req.params.friendId;

    await Friend.deleteOne({ owner, friend: friendId, status: 'following' });
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateNickname = async (req, res) => {
  try {
    const owner = await resolveCurrentUser(req);
    const friendId = req.params.friendId;
    const newNickname = (req.body.nickname || '').trim();

    await Friend.updateOne(
      { owner, friend: friendId, status: 'following' },
      { nickname: newNickname }
    );
    res.redirect('/friends');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.viewFriendWatchlist = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const friend = await User.findById(friendId, 'username');
    if (!friend) return res.status(404).send('Friend not found');

    res.render('friend-watchlist', {
      friend,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
