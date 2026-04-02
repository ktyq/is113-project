// Movie page (agnella)
// C: create review
// R: read movie, read reviews
// U: update reviews
// D: delete review
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { isLoggedIn } = require("../middleware/authentication");

router.get("/", reviewController.showReviews);
router.post("/add", isLoggedIn, reviewController.createReview);
router.post("/edit", isLoggedIn, reviewController.updateReview);
router.post("/del", isLoggedIn, reviewController.deleteReview);

module.exports = router;
