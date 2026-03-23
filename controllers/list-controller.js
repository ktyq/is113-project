const fs = require('fs/promises');

const List = require('./../models/Watchlist');

// viewUserList // userid, list type (planned, watched), order
exports.viewUserList = async (req, res) => {
    res.render('watchlist', {});
    // res.send(`viewUserList`);
};

// editUserListItem // userid, movieid, listtype, edit info
exports.editUserListItem = async (req, res) => {
    res.send(`editUserListItem`);
};

// addToUserList // userid, movieid, listtype, info
exports.addToUserList = async (req, res) => {
    res.send(`addToUserList`);
};

// deleteFromUserL ist // userid, movieid
exports.deleteFromUserList = async (req, res) => {
    res.send(`deleteFromUserList`);
};

// updateListMovie // userid, movieid, listtype
exports.updateListMovie = async (req, res) => {
    res.send(`updateListMovie`);
};

// reorderMovieList // userid, movieid, listtype, priority
exports.reorderMovieList = async (req, res) => {
    res.send(`reorderMovieList`);
};


exports.showBooks = async (req, res) => {
    try {
        let bookList = await Book.retrieveAll();// fetch all the list    
        console.log(bookList);
        res.render("display-book", { bookList }); // Render the EJS form view and pass the posts
    } catch (error) {
        console.error(error);
        res.send("Error reading database"); // Send error message if fetching fails
    }
};





