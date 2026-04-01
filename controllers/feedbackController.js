// import Feedback model (feedback collection)
const Feedback = require("../models/Feedback");

// import User model (needed for populate to get username)
const User = require("../models/user");

// CREATE feedback (user submit form)
exports.createFeedback = async (req, res) => {
    try {
    // get userID and message from request body    
    const {userID, problemMessage} = req.body
    
    // create new feedback in database
    await Feedback.create({
        UserID: userID,         // store reference to user
        problemMessage: problemMessage
    }); // try-catch to handle any errors safely during creation

    // redirect back to feedback page 
    return res.redirect("/feedback");

    } catch (err) {
        console.error("createFeedback error:", err);
        return res.status(500).send("Could not submit feedback. Please try again.");
    }
};

// READ all feedback (admin view)
exports.readFeedback = async (req, res) => {
    try {
        // get all feedback, populate userID to get username, sort by newest first
        const feedbacks = await Feedback.find()
        .populate("userID", "username")
        .sort({ createdAt: -1 });

        // render feedback page and pass feedbacks to view. C,U,D redirects to the 
        // feedback page which calls it to reload with updated data
        res.render("feedback", { feedbacks });

    } catch (err) {
        console.error("readFeedback error:", err);
        res.status(500).render("error", { message: "Could not retrieve feedback." });
    }
};

// UPDATE feedback (admin mark as resolved)
exports.updateFeedback = async (req, res) => {
    try {
        // find feedback by id and set status to true (resolved)
        await Feedback.findByIdAndUpdate(req.params.id, {status: true}); // can only update from unresolved (f) to resolved (t)
        
        res.redirect("/feedback");

    } catch (err) {
        console.error("updateFeedback error:", err);
        res.status(500).render("error", { message: "Could not update feedback." });
    }
};

// DELETE feedback (admin delete spam or irrelevant feedback)
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