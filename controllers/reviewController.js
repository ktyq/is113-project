const Review = require("../models/review");
const Movie = require("../models/movie");

exports.getMoviePage = async (req, res) => {
  try {
    const movieID = req.query.movieID;
    const movie = await Movie.findByID(movieID);

    if (!movie) {
      return res.status(404).send("Movie not found.");
    }

    const reviews = await review
      .find({ movieID: movieID })
      .populate("userID", "username")
      .sort({ createdAt: -1 });

    res.render("movie", {
      movie,
      reviews,
      currentUser: req.session.user || null,
      errors: [],
    });
  } catch (err) {
    console.error("getMoviePage error: ", err);
    res.status(500).render("error", { message: "Something went wrong." });
  }
};

exports.createReview = async (req, res) => {
  const { movieID, comment, rating, isAnonymous } = req.body;

  const rerenderWithErrors = async (errors) => {
    const movie = await Movie.findByID(movieID);
    const reviews = await review
      .find({ movieID: movieID })
      .populate("userID", "username")
      .sort({ createdAt: -1 });
    return res.render("movie", {
      movie,
      reviews,
      errors,
      currentUser: req.session.user,
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
      userID: req.session.user._id,
      rating: parsedRating,
      comment: comment ? comment.trim() : "",
      isAnonymous: isAnonymous === "on",
    });

    res.redirect(`/reviews?movieID=${movieID}`);
  } catch (err) {
    console.error("createReview error:", err);
    return rerenderWithErrors(["Could not save review. Please try again."]);
  }
};

exports.updateReview = async (req, res) => {
  const { reviewID, movieID, comment, rating, isAnonymous } = req.body;
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).render("error", { message: "Review not found." });
    }
    if (review.userID.toString() !== req.session.user._id.toString()) {
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
      const movie = await Movie.findById(review.movieID);
      const reviews = await Review.find({ movieID: review.movieID })
        .populate("userID", "username")
        .sort({ createdAt: -1 });
      return res.render("movie", {
        movie,
        reviews,
        errors,
        currentUser: req.session.user,
      });
    }

    review.rating = parsedRating;
    review.comment = comment ? comment.trim() : "";
    review.isAnonymous = isAnonymous === "on";
    await review.save();
    res.redirect(`/reviews?movieID=${review.movieID}`);
  } catch (err) {
    console.error("updateReview error:", err);
    res.status(500).render("error", { message: "Could not update review." });
  }
};

exports.deleteReview = async (req, res) => {
  const { reviewId } = req.body;
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).render("error", { message: "Review not found." });
    }

    if (review.userID.toString() !== req.session.user._id.toString()) {
      return res
        .status(403)
        .render("error", { message: "You cannot delete this review." });
    }

    const movieID = review.movieID;
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/reviews?movieID=${movieID}`);
  } catch (err) {
    console.error("deleteReview error:", err);
    res.status(500).render("error", { message: "Could not delete review." });
  }
};
