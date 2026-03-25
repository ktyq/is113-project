const fs = require('fs/promises');

const List = require('../models/Watchlist');

// viewUserList // userid, list type (planned, watched), order
exports.viewUserList = async (req, res) => {
    // res.send(`viewUserList`);
    user = '69c39ce645385a80651325ed';
    page = 1;
    total = 10;
    status = 'planning';
    settings = {
        priority: 1, // ascending
        createdAt: 0, // unset
        title: 0 // unset
    };

    console.log(user);
    try {
        let watchlist = await List.getListsByUser(user, page, total, status, settings);
        res.status(200).json({ watchlist });
        // res.render("display-book", { bookList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};

exports.getMovieStatus = async (req, res) => {
    // const { userId, movieId } = req.params;
    user = '69c39ce645385a80651325ed';
    movie = '69c39ce645385a80651325f7';

    try {
        const status = await List.getMovieStatus(user, movie);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// editUserListItem // userid, movieid, listtype, edit info
exports.editUserListItem = async (req, res) => {
    user = '69c39ce645385a80651325ed';
    movie = '69c39ce645385a80651325f7';

    update = {
        status: null,
        notes: null,
        priority: null
    };

    try {
        const status = await List.updateWatchlistMovie(user, movie, update);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// addToUserList // userid, movieid, listtype, info
exports.addToUserList = async (req, res) => {
    user = '69c39ce645385a80651325ed';
    movie = '69c39ce645385a80651325f7';
    list = 'planning';

    try {
        let newItem = await List.createUserList(user, movie, list);
        res.status(200).json({ newItem });
        // res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// deleteFromUserL ist // userid, movieid
exports.deleteFromUserList = async (req, res) => {
    // const { user, movie } = req.body;
    user = '69c39ce645385a80651325ed';
    movie = '69c39ce645385a80651325f7';
    
    try {
        await List.deleteFromUserList(user, movie);
        // res.redirect('/');
        res.status(200).json('success');

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
