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
const { isLoggedIn, isAdmin } = require("../middleware/authentication");

// Create/submit feedback using post 
router.post('/', isLoggedIn, feedbackController.createFeedback);

// Read feedback, loads and displays all the feedback
router.get('/', isLoggedIn, feedbackController.readFeedback);
router.get('/admin', isAdmin ,feedbackController.readFeedbackAdmin);

// Update feedback (mark as resolved)
// Update feedback (admin mark as resolved)
router.post('/resolve/:id', isAdmin, feedbackController.updateFeedback);

// Delete feedback from user
router.post('/delete/:id', isLoggedIn, feedbackController.deleteFeedback);

module.exports = router