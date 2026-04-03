// controllers/feedbackController.js
const Feedback = require("../models/Feedback");
const User = require("../models/User");

// CREATE feedback (user submit form)
exports.createFeedback = async (req, res) => {
    try {
    // get userID and message from request body
    const user = req.session.user
    const {type, url, notes} = req.body
    
    // create new feedback in database
    await Feedback.create({
        sentBy: user.id,
        type : type,
        status: "pending",
        url: url,
        notes: notes
    }); // try-catch to handle any errors safely during creation

    // redirect back to feedback page 
    return res.redirect("/feedback");

    } catch (err) {
        console.error("createFeedback error:", err);
        return res.status(500).send("Could not submit feedback. Please try again.");
    }
};

// READ all feedback by user (if on normal user account can only read their own feedback)
exports.readFeedback = async (req, res) => {
    try {
        const user = req.session.user

        // if admin, redirect to admin feedback page

        // get all feedback, populate userID to get username, sort by newest first
       const feedbacks = await Feedback.find({ sentBy: user.id }).sort({ createdAt: -1 });

        // render feedback page and pass feedbacks to view. C,U,D redirects to the 
        // feedback page which calls it to reload with updated data
        return res.render("feedback", { feedbacks, user });

    } catch (err) {
        console.error("readFeedback error:", err);
        res.status(500).render("error", { message: "Could not retrieve feedback." });
    }
};

// READ all feedback by admin
exports.readFeedbackAdmin = async (req, res) => {
    try {
        // get all feedback, populate userID to get username, sort by newest first, populate is joining feedback with user
        const feedbacks = await Feedback.find().populate("sentBy", "username").sort({ createdAt: -1 });

        // render feedback page and pass feedbacks to view. C,U,D redirects to the 
        // feedback page which calls it to reload with updated data
        return res.render("admin-feedback", { feedbacks, user: req.session.user});

    } catch (err) {
        console.error("readFeedback error:", err);
        res.status(500).render("error", { message: "Could not retrieve feedback." });
    }
};

// UPDATE feedback (admin status change)
exports.updateFeedback = async (req, res) => {
    try {
        // Get the status value from the <select name="status"> in your EJS
        const { status } = req.body;

        // Update the database with the new status (pending or resolved)
        await Feedback.findByIdAndUpdate(req.params.id, { status: status }); 
        
        // Redirect back to the admin page to see the change
        res.redirect("/feedback/admin");

    } catch (err) {
        console.error("updateFeedback error:", err);
        res.status(500).render("error", { message: "Could not update feedback." });
    }
};

// DELETE feedback only for user, not admin (user cannot delete if status is resolved)
exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;

        // Find the feedback to check its status
        const feedback = await Feedback.findById(feedbackId);

        // Safety check: if feedback doesn't exist
        if (!feedback) {
            return res.status(404).render("error", { message: "Feedback not found." });
        }

        // Logic: If status is 'resolved', block deletion
        // Ensure 'resolved' matches the exact string you use in your update controller
        if (feedback.status === 'resolved') {
            return res.status(403).render("error", { 
                message: "This feedback has been resolved by an admin and cannot be deleted." 
            });
        }

        // Proceed with deletion
        await Feedback.findByIdAndDelete(feedbackId);

        res.redirect("/feedback");

    } catch (err) {
        console.error("deleteFeedback error:", err);
        res.status(500).render("error", { message: "Could not delete feedback." });
    }
};