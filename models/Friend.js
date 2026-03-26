// friendSchema
// _id: ObjectId
// requester: String
// recipient: String
// status: String ['pending', 'accepted', 'declined', 'blocked']
// createdAt: Date (date added as friends)
// updatedAt: Date

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
        type: String,
        enum: ['following'],
        required: true,
        default: 'following'
    },
    nickname: {
        type: String,
        default: ''
    }
}, { timestamps: true });

friendSchema.index({ owner: 1, friend: 1 }, { unique: true });

// helper methods
friendSchema.statics.getFriendsForUser = function(ownerId) {
  return this.find({ owner: ownerId, status: 'following' }).populate('friend', 'username');
};

friendSchema.statics.findSuggestedUsers = async function(ownerId, limit = 5) {
  const existingFriendIds = await this.find({ owner: ownerId, status: 'following' }).distinct('friend');
  return this.model('User').aggregate([
    { $match: { _id: { $nin: [ownerId, ...existingFriendIds] } } },
    { $sample: { size: limit } },
    { $project: { username: 1 } },
  ]);
};

friendSchema.statics.addFriend = function(ownerId, friendId, nickname = '') {
  return this.findOneAndUpdate(
    { owner: ownerId, friend: friendId },
    { owner: ownerId, friend: friendId, status: 'following', nickname },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );
};

friendSchema.statics.removeFriend = function(ownerId, friendId) {
  return this.deleteOne({ owner: ownerId, friend: friendId, status: 'following' });
};

friendSchema.statics.updateNickname = function(ownerId, friendId, nickname) {
  // Update the nickname displayed for a friend in the owner's list
  return this.updateOne({ owner: ownerId, friend: friendId, status: 'following' }, { nickname });
};

// Export the model so other modules can require('models/Friend')
module.exports = mongoose.model('Friend', friendSchema);

