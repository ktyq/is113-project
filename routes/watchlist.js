// // Watchlist (kt)

// const express = require('express');
// const listController = require('./../controllers/listController');
// const router = express.Router();

// // view planned , watched
// router.get("/", listController.viewUserList); // user, list type (planned, watched), order
// router.get("/status", listController.getMovieStatus); // user, list type (planned, watched), order

// // update movie in watchlist | reorder, update notes, update status
// router.post("/edit", listController.editUserListItem); // userid, listtype, movieid, edit info

// // add movie to watchlist
// router.post("/add", listController.addToUserList); // userid, listtype, movieid, edit info

// // delete movie from watchlist
// router.post("/del", listController.deleteFromUserList);

// module.exports = router;