// models/Friend.js
// Bidirectional friend request model
// requestor = user who sent the friend request
// requestee = user who received the friend request
// nickname1 = nickname given to requestor by requestee (only requestee can update)
// nickname2 = nickname given to requestee by requestor (only requestor can update)
// status = pending (awaiting requestee response) | accepted (are friends)
// friendsSince = timestamp when status changed to 'accepted'

const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    requestor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requestor is required']
    },
    requestee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requestee is required']
    },
    nickname1: {
        // Nickname for requestor, given by requestee (only requestee can edit)
        type: String,
        default: ''
    },
    nickname2: {
        // Nickname for requestee, given by requestor (only requestor can edit)
        type: String,
        default: ''
    },
    status: {
        // 'declined' removed — decline and remove both delete the entry entirely
        type: String,
        enum: ['pending', 'accepted'],
        required: true,
        default: 'pending'
    },
    friendsSince: {
        // Timestamp when status changed to 'accepted'
        type: Date,
        default: null
    }
}, { timestamps: true });

// Enforce unique one-way request entry per requestor/requestee pair
friendSchema.index({ requestor: 1, requestee: 1 }, { unique: true });

// Fetch all accepted friendships for a user (both directions)
friendSchema.statics.getFriendsForUser = function(userId) {
  return this.find({
    $or: [
      { requestor: userId, status: 'accepted' },
      { requestee: userId, status: 'accepted' }
    ]
  }).populate('requestor requestee', 'username');
};

// Fetch all pending requests where userId is the requestee
friendSchema.statics.getPendingRequestsForUser = function(userId) {
  return this.find({ requestee: userId, status: 'pending' }).populate('requestor', 'username');
};

// Fetch all pending requests where userId is the requestor (sent, awaiting response)
friendSchema.statics.getSentRequestsForUser = function(userId) {
  return this.find({ requestor: userId, status: 'pending' }).populate('requestee', 'username _id');
};

// Suggest random users not in any active friend relationship with userId.
// Users who have declined or been removed are eligible to appear again
// since those entries are deleted — only exclude accepted/pending pairs.
friendSchema.statics.findSuggestedUsers = async function(userId, limit = 5) {
  const User = this.model('User');

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [requestors, requestees] = await Promise.all([
    this.find({
      $or: [{ requestor: userObjectId }, { requestee: userObjectId }],
      status: { $in: ['accepted', 'pending'] }
    }).distinct('requestor'),
    this.find({
      $or: [{ requestor: userObjectId }, { requestee: userObjectId }],
      status: { $in: ['accepted', 'pending'] }
    }).distinct('requestee'),
  ]);

  const exclusions = [...new Set([userObjectId, ...requestors, ...requestees])];

  return User.aggregate([
    { $match: { _id: { $nin: exclusions } } },
    { $sample: { size: limit } },
    { $project: { username: 1 } },
  ]);
};

// Send a friend request
friendSchema.statics.sendRequest = function(requestorId, requesteeId) {
  return this.findOneAndUpdate(
    { requestor: requestorId, requestee: requesteeId },
    { requestor: requestorId, requestee: requesteeId, status: 'pending' },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );
};

// Cancel a sent pending request (delete the entry completely)
friendSchema.statics.cancelRequest = function(requestorId, requesteeId) {
  return this.deleteOne({ requestor: requestorId, requestee: requesteeId, status: 'pending' });
};

// Accept a pending friend request
friendSchema.statics.acceptRequest = function(requestorId, requesteeId) {
  return this.updateOne(
    { requestor: requestorId, requestee: requesteeId, status: 'pending' },
    { status: 'accepted', friendsSince: new Date() }
  );
};

// Decline a friend request — deletes the entry completely so both users
// can appear in each other's suggestions pool again
friendSchema.statics.declineRequest = function(requestorId, requesteeId) {
  return this.deleteOne({ requestor: requestorId, requestee: requesteeId });
};

// Remove friend — deletes the accepted relationship entry completely so both
// users can appear in each other's suggestions pool again
friendSchema.statics.removeFriend = function(userId1, userId2) {
  return this.deleteOne({
    $or: [
      { requestor: userId1, requestee: userId2, status: 'accepted' },
      { requestor: userId2, requestee: userId1, status: 'accepted' }
    ]
  });
};

// Update nickname (only the respective user can update their assigned nickname)
friendSchema.statics.updateNickname = function(userId, friendId, nicknameValue, isNickname1) {
  const updateField = isNickname1 ? 'nickname1' : 'nickname2';

  if (isNickname1) {
    // Only requestee can update nickname1 (for requestor)
    return this.updateOne(
      { requestor: friendId, requestee: userId, status: 'accepted' },
      { [updateField]: nicknameValue }
    );
  } else {
    // Only requestor can update nickname2 (for requestee)
    return this.updateOne(
      { requestor: userId, requestee: friendId, status: 'accepted' },
      { [updateField]: nicknameValue }
    );
  }
};

module.exports = mongoose.model('Friend', friendSchema);