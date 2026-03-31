const Feedback = require("../models/Feedback");
const User = require("../models/User");

exports.createFeedback = async (req, res) => {
    try {
    const {userID, problemMessage} = req.body

    await Feedback.create({UserID: userID, problemMessage: problemMessage})

    return res.redirect("/feedback") 
    } catch (err) {
        console.error("createFeedback error:", err);
        return res.status(500).send("Could not submit feedback. Please try again.");
    }
};


exports.readFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate("userID", "username").sort({ createdAt: -1 });
        res.render("feedback", { feedbacks });
    } catch (err) {
        console.error("readFeedback error:", err);
        res.status(500).render("error", { message: "Could not retrieve feedback." });
    }
};

exports.updateFeedback = async (req, res) => {
    try {
        await Feedback.findByIdAndUpdate(req.params.id, {status: true}) // can only update from unresolved (f) to resolved (t)
        res.redirect("/feedback")
    } catch (err) {
        console.error("updateFeedback error:", err);
        res.status(500).render("error", { message: "Could not update feedback." });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id)
        res.redirect("/feedback")
    } catch (err) {
        console.error("deleteFeedback error:", err);
        res.status(500).render("error", { message: "Could not delete feedback." });
    }
};