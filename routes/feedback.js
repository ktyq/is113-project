// // Feedback page (kaylene) 
// // C: submit feedback -> post
// // R: read reports by admin -> get
// // U: admin mark resolved -> post / put
// // D: admin delete reports if spam -> post / delete

// const express = require("express");
// const router = express.Router();
// const feedback = require("../models/Feedback");

// // Create
// router.post('/', async (req, res) => {
//     const userID = req.body.userID
//     const message = req.body.problemMessage

//     await feedback.create({UserID: userID, problemMessage: message})

//     res.redirect("/feedback") // how do we want to this?? send?
// });

// // Read
// router.get('/', async (req, res) => {
//     const data = await feedback.find() // get data
//     res.render({Data: data}) // render data
// });

// // Update
// router.put('/:id', async (req, res) => {
//     const updates = await feedback.findByIdAndUpdate(req.params.id, {status: true}) // can only update from unresolved (f) to resolved (t)
//     res.redirect("/feedback")
// });

// // Delete
// router.delete('/:id', async (req, res) => {
//     const spam = await feedback.findByIdAndDelete(req.params.id)
//     res.redirect("/feedback")
// });

// module.exports = router