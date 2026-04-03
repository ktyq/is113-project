// controllers/reviewController.js
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Movie = require("../models/Movie");

// Display all reviews
exports.showReviews = async (req, res) => {
  const movieId = req.query.movieId;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const { user } = req.session;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).send("Movie not found.");
    }

    let userReview = null;
    if (user) {
      userReview = await Review.findOne({
        movieID: movieId,
        userID: user.id,
      });
    }

    const totalReviews = await Review.countDocuments({ movieID: movieId });
    const totalPages = Math.ceil(totalReviews / limit);

    const reviews = await Review.find({ movieID: movieId })
      .populate("userID", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render("review", {
      movie,
      reviews,
      currentUser: req.session.user || null,
      userReview,
      errors: [],
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalReviews: totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      user,
    });
  } catch (err) {
    console.error("getMoviePage error: ", err);
    return res.status(500).send("Something went wrong.");
  }
};

// Add new review
exports.createReview = async (req, res) => {
  const { movieId, comment, rating, isAnonymous } = req.body;
  const { user } = req.session;
  const userId = user?.id;
  console.log("Session user:", user);
  console.log("User ID:", userId);

  const rerenderWithErrors = async (errors) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const movie = await Movie.findById(movieId);

    let userReview = null;
    if (user) {
      userReview = await Review.findOne({
        movieID: movieId,
        userID: user.id,
      });
    }

    const totalReviews = await Review.countDocuments({ movieID: movieId });
    const totalPages = Math.ceil(totalReviews / limit);

    const reviews = await Review.find({ movieID: movieId })
      .populate("userID", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.render("review", {
      movie,
      reviews,
      errors,
      currentUser: req.session.user,
      userReview,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalReviews: totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      user,
    });
  };

  const existingReview = await Review.findOne({
    movieID: movieId,
    userID: userId,
  });

  if (existingReview) {
    return rerenderWithErrors([
      "You have already written a review for this movie. Please edit your existing review instead.",
    ]);
  }

  const errors = [];
  const parsedRating = parseInt(rating);
  if (comment && comment.length > 8000) {
    errors.push("Comment cannot exceed 8000 characters.");
  }
  if (errors.length > 0) {
    return rerenderWithErrors(errors);
  }

  try {
    await Review.create({
      movieID: movieId,
      userID: req.session.user.id,
      rating: parsedRating,
      comment: comment ? comment.trim() : "",
      isAnonymous: isAnonymous === "on",
    });

    res.redirect(`/reviews?movieId=${movieId}`);
  } catch (err) {
    console.error("createReview error:", err);
    return rerenderWithErrors(["Could not save review. Please try again."]);
  }
};

// update review
exports.updateReview = async (req, res) => {
  const { reviewId, movieId, comment, rating, isAnonymous } = req.body;
  const { user } = req.session;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.redirect(`/reviews?movieId=${movieId}&err=not-found`);
    }
    if (review.userID.toString() !== req.session.user.id.toString()) {
      return res.redirect(`/reviews?movieId=${movieId}&err=unauthorized`);
    }
    const errors = [];
    const parsedRating = parseInt(rating);
    if (comment && comment.length > 8000) {
      errors.push("Comment cannot exceed 8000 characters.");
    }

    if (errors.length > 0) {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const movie = await Movie.findById(review.movieID);

      let userReview = await Review.findOne({
        movieID: review.movieID,
        userID: user.id,
      });

      const totalReviews = await Review.countDocuments({
        movieID: review.movieID,
      });
      const totalPages = Math.ceil(totalReviews / limit);

      const reviews = await Review.find({ movieID: review.movieID })
        .populate("userID", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.render("review", {
        movie,
        reviews,
        errors,
        currentUser: req.session.user,
        userReview,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalReviews: totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        user,
      });
    }

    review.rating = parsedRating;
    review.comment = comment ? comment.trim() : "";
    review.isAnonymous = isAnonymous === "on";
    await review.save();
    res.redirect(`/reviews?movieId=${review.movieID}`);
  } catch (err) {
    res.redirect(`/reviews?movieId=${movieId}&err=update-failed`);
  }
};

// delete review
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.body;
  const { user } = req.session;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.redirect(`/reviews?movieId=${reviewId}&err=not-found`);
    }
    const movieId = review.movieID;
    if (review.userID.toString() !== req.session.user.id.toString()) {
      return res.redirect(`/reviews?movieId=${movieId}&err=unauthorized`);
    }

    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/reviews?movieId=${movieId}`);
  } catch (err) {
    res.redirect(`/reviews?err=delete-failed`);
  }
};
