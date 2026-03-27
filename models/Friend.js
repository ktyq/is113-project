// models/Friend.js
// One-way follow relationship model, styled after a friend list.
// owner = current user, friend = followed user
// status = following

const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required']
    },
    friend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Friend is required']
    },
    status: {
        // Only one active follow state for now
        type: String,
        enum: ['following'],
        required: true,
        default: 'following'
    },
    nickname: {
        // Optional alias for the followed user
        type: String,
        default: ''
    }
}, { timestamps: true });

// Enforce unique one-way follow entry per owner/friend pair
friendSchema.index({ owner: 1, friend: 1 }, { unique: true });

// Fetch all following relationships for user with populated friend data
friendSchema.statics.getFriendsForUser = function(ownerId) {
  return this.find({ owner: ownerId, status: 'following' }).populate('friend', 'username nickname');
};

// Suggest random users the owner does not currently follow
friendSchema.statics.findSuggestedUsers = async function(ownerId, limit = 5) {
  const existingFriendIds = await this.find({ owner: ownerId, status: 'following' }).distinct('friend');
  return this.model('User').aggregate([
    { $match: { _id: { $nin: [ownerId, ...existingFriendIds] } } },
    { $sample: { size: limit } },
    { $project: { username: 1 } },
  ]);
};

// Add or refresh a following relationship (upsert)
friendSchema.statics.addFriend = function(ownerId, friendId, nickname = '') {
  return this.findOneAndUpdate(
    { owner: ownerId, friend: friendId },
    { owner: ownerId, friend: friendId, status: 'following', nickname },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );
};

// Unfollow (delete the following relationship)
friendSchema.statics.removeFriend = function(ownerId, friendId) {
  return this.deleteOne({ owner: ownerId, friend: friendId, status: 'following' });
};

// Change nickname for existing following relation
friendSchema.statics.updateNickname = function(ownerId, friendId, nickname) {
  return this.updateOne({ owner: ownerId, friend: friendId, status: 'following' }, { nickname });
};

// Export model for use in controllers/routes
module.exports = mongoose.model('Friend', friendSchema);

