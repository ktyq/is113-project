// models/Friend.js
// Bidirectional friend request model
// requestor = user who sent the friend request
// requestee = user who received the friend request
// nickname1 = nickname given to requestor by requestee (only requestee can update)
// nickname2 = nickname given to requestee by requestor (only requestor can update)
// status = pending (awaiting requestee response), accepted (are friends), declined, blocked
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
        // Status of the friend relationship
        type: String,
        enum: ['pending', 'accepted', 'declined', 'blocked'],
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

// Suggest random users not in any friend relationship with userId
// FIX: Replaced broken chained .then() logic with Promise.all, and cast userId to ObjectId
// to ensure $nin exclusions work correctly in the aggregation pipeline.
friendSchema.statics.findSuggestedUsers = async function(userId, limit = 5) {
  const User = this.model('User');

  // Cast to ObjectId so string IDs (from req.query/body) don't slip through $nin unmatched
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Fetch all users connected to this user (any status, either direction) in parallel
  const [requestors, requestees] = await Promise.all([
    this.find({
      $or: [{ requestor: userObjectId }, { requestee: userObjectId }]
    }).distinct('requestor'),
    this.find({
      $or: [{ requestor: userObjectId }, { requestee: userObjectId }]
    }).distinct('requestee'),
  ]);

  // Deduplicate the exclusion list
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

// Accept a pending friend request
friendSchema.statics.acceptRequest = function(requestorId, requesteeId) {
  return this.updateOne(
    { requestor: requestorId, requestee: requesteeId, status: 'pending' },
    { status: 'accepted', friendsSince: new Date() }
  );
};

// Decline a friend request
friendSchema.statics.declineRequest = function(requestorId, requesteeId) {
  return this.updateOne(
    { requestor: requestorId, requestee: requesteeId },
    { status: 'declined' }
  );
};

// Block a user (sets status to blocked)
friendSchema.statics.blockUser = function(requestorId, requesteeId) {
  return this.updateOne(
    { requestor: requestorId, requestee: requesteeId },
    { status: 'blocked' }
  );
};

// Remove friend (delete the relationship)
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

// Export model for use in controllers/routes
module.exports = mongoose.model('Friend', friendSchema);