// Feedback page (kaylene) 
// C: submit feedback -> post
// R: read reports by admin -> get
// U: admin mark resolved -> post / put
// D: admin delete reports if spam -> post / delete

// import express and create router
const express = require("express");
const router = express.Router();

// import controller file (CRUD)
const feedbackController = require("../controllers/feedbackController");

// Create/submit feedback using post 
router.post('/', feedbackController.createFeedback);

// Read feedback, loads and displays all the feedback
router.get('/', feedbackController.readFeedback);

// Update feedback (mark as resolved)
// :id -> route parameter to identify which feedback to update
router.post('/:id', feedbackController.updateFeedback);

// Delete feedback (spam or irrelevant feedback)
// deletes feedback using id
router.delete('/:id', feedbackController.deleteFeedback); 

module.exports = router