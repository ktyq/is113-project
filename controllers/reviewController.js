const Review = require("../models/review");
const Movie = require("../models/Movie");

exports.showReviews = async (req, res) => {
  try {
    const movieID = req.query.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const movie = await Movie.findById(movieID);

    if (!movie) {
      return res.status(404).send("Movie not found.");
    }

    const totalReviews = await Review.countDocuments({ movieID: movieID });
    const totalPages = Math.ceil(totalReviews / limit);

    const reviews = await Review.find({ movieID: movieID })
      .populate("userID", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render("review", {
      movie,
      reviews,
      currentUser: req.session.user || null,
      errors: [],
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalReviews: totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("getMoviePage error: ", err);
    res.status(500).render("error", { message: "Something went wrong. " });
  }
};

exports.createReview = async (req, res) => {
  const { movieID, comment, rating, isAnonymous } = req.body;

  console.log("Session user:", req.session.user);
  console.log("User ID:", req.session.user?.id);

  const rerenderWithErrors = async (errors) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const movie = await Movie.findById(movieID);
    const totalReviews = await Review.countDocuments({ movieID: movieID });
    const totalPages = Math.ceil(totalReviews / limit);

    const reviews = await Review.find({ movieID: movieID })
      .populate("userID", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.render("review", {
      // Changed to "review"
      movie,
      reviews,
      errors,
      currentUser: req.session.user,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalReviews: totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  };

  const errors = [];
  const parsedRating = parseInt(rating);
  if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
    errors.push("Rating must be a whole number between 1 and 5. ");
  }
  if (comment && comment.length > 8000) {
    errors.push("Comment cannot exceed 8000 characters.");
  }
  if (errors.length > 0) {
    return rerenderWithErrors(errors);
  }

  try {
    await Review.create({
      movieID: movieID,
      userID: req.session.user.id,
      rating: parsedRating,
      comment: comment ? comment.trim() : "",
      isAnonymous: isAnonymous === "on",
    });

    res.redirect(`/reviews?id=${movieID}`);
  } catch (err) {
    console.error("createReview error:", err);
    return rerenderWithErrors(["Could not save review. Please try again."]);
  }
};

exports.updateReview = async (req, res) => {
  const { reviewID, movieID, comment, rating, isAnonymous } = req.body;
  try {
    const review = await Review.findById(reviewID);

    if (!review) {
      return res.status(404).render("error", { message: "Review not found." });
    }
    if (review.userID.toString() !== req.session.user.id.toString()) {
      return res
        .status(403)
        .render("error", { message: "You cannot edit this review." });
    }
    const errors = [];
    const parsedRating = parseInt(rating);

    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      errors.push("Rating must be a whole number between 1 and 5.");
    }
    if (comment && comment.length > 8000) {
      errors.push("Comment cannot exceed 8000 characters.");
    }

    if (errors.length > 0) {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const movie = await Movie.findById(review.movieID);
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
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalReviews: totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    review.rating = parsedRating;
    review.comment = comment ? comment.trim() : "";
    review.isAnonymous = isAnonymous === "on";
    await review.save();
    res.redirect(`/reviews?id=${review.movieID}`);
  } catch (err) {
    console.error("updateReview error:", err);
    res.status(500).render("error", { message: "Could not update review." });
  }
};

exports.deleteReview = async (req, res) => {
  const { reviewID } = req.body;
  try {
    const review = await Review.findById(reviewID);

    if (!review) {
      return res.status(404).render("error", { message: "Review not found." });
    }

    if (review.userID.toString() !== req.session.user.id.toString()) {
      return res
        .status(403)
        .render("error", { message: "You cannot delete this review." });
    }

    const movieID = review.movieID;
    await Review.findByIdAndDelete(reviewID);

    res.redirect(`/reviews?movieID=${movieID}`);
  } catch (err) {
    console.error("deleteReview error:", err);
    res.status(500).render("error", { message: "Could not delete review." });
  }
};
