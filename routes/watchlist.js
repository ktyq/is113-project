// routes/watchlist.js
const express = require('express');
const listController = require('./../controllers/listController');
const authMiddleware = require('../middleware/authentication');
const router = express.Router();
router.use(authMiddleware.isLoggedIn);

// view planned , watched
router.get("/", listController.viewUserList); // user, list type (planned, watched), order
// router.get("/view", listController.viewOtherUserList); // view another user's watchlist with privacy
router.get("/status", listController.getMovieStatus); // user, list type (planned, watched), order

// update movie in watchlist | reorder, update notes, update status
router.post("/edit", listController.editUserListItem); // userid, listtype, movieid, edit info

// delete movie from watchlist
router.post("/remove", listController.deleteFromUserList);

// add movie to watchlist
router.post("/add", listController.addToUserList); // userid, listtype, movieid, edit info

module.exports = router;