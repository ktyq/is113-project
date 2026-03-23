// Movie page (agnella)
// C: create review
// R: read movie, read reviews
// U: update reviews
// D: delete review
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { isAuthenticated } = require("../middleware/authentication");

router.get("/", reviewController.getMoviePage);
router.post("/add", isAuthenticated, reviewController.createReview);
router.post("/edit", isAuthenticated, reviewController.updateReview);
router.post("/del", isAuthenticated, reviewController.deleteReview);

module.exports = router;
