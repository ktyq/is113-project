// routes/reviews.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { isLoggedIn } = require("../middleware/authentication");

// Display all reviews
router.get("/", reviewController.showReviews);

// Create new review
router.post("/add", isLoggedIn, reviewController.createReview);

// Edit existing review on movie
router.post("/edit", isLoggedIn, reviewController.updateReview);

// Delete review
router.post("/del", isLoggedIn, reviewController.deleteReview);

module.exports = router;