// reviewSchema
// _id: ObjectId
// userID: ObjectId
// movieID: ObjectId
// rating: Number [1-5]
// comment: String [max: 8000]
// isAnonymous: Boolean
// createdAt: Date
// updatedAt: Date

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    movieID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required"],
      // unique: true
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be 1 or more"],
      max: [5, "Rating cannot be more than 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be whole number",
      },
    },
    comment: {
      type: String,
      required: false,
      maxLength: [8000, "Comments cannot exceed 8000 characters"],
    },
    isAnonymous: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
