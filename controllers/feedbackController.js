// import Feedback model (feedback collection)
const Feedback = require("../models/Feedback");

// import User model (needed for populate to get username)
const User = require("../models/user");

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

// READ all feedback by user
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
        // 1. Get the status value from the <select name="status"> in your EJS
        const { status } = req.body;

        // 2. Update the database with the new status (pending or resolved)
        await Feedback.findByIdAndUpdate(req.params.id, { status: status }); 
        
        // 3. Redirect back to the admin page to see the change
        res.redirect("/feedback/admin");

    } catch (err) {
        console.error("updateFeedback error:", err);
        res.status(500).render("error", { message: "Could not update feedback." });
    }
};

// DELETE feedback (admin delete spam or irrelevant feedback) only for user, not admin
exports.deleteFeedback = async (req, res) => {
    try {
        // delete feedback using id
        await Feedback.findByIdAndDelete(req.params.id);

        res.redirect("/feedback")

    } catch (err) {
        console.error("deleteFeedback error:", err);
        res.status(500).render("error", { message: "Could not delete feedback." });
    }
};