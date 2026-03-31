// Feedback page (kaylene) 
// C: submit feedback -> post
// R: read reports by admin -> get
// U: admin mark resolved -> post / put
// D: admin delete reports if spam -> post / delete

const express = require("express");
const router = express.Router();
const feedback = require("../models/Feedback");
const feedbackController = require("../controllers/feedbackController");

// Create
router.post('/', feedbackController.createFeedback);

// Read
router.get('/', feedbackController.readFeedback);

// Update
router.post('/:id', feedbackController.updateFeedback);

// Delete
router.post('/:id', feedbackController.deleteFeedback); 

module.exports = router