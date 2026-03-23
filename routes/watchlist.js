// Watchlist (kt)
// U: update watch list
// D: delete movie/ watchlist

const express = require("express");
const router = express.Router();

// GET /user/movies/lists (get user movie list)
// GET /user/reviews (get user reviews)
//

router.get('/', (req, res) => {
    res.send("hi")
})

// todo view watchlists
router.get('/lists', (req, res) => {

});

// todo add movie to list
router.put('/:userid/list/:listid/:movieid', (req, res) => {

});

module.exports = router;