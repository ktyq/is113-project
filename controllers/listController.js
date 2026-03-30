const fs = require('fs/promises');

const List = require('../models/Watchlist');
const TEST_USER = '69c39ce645385a80651325ed';

// viewUserList // userid, list type (planned, watched), order
exports.viewUserList = async (req, res) => {
    const user = (req.session && req.session.user) || TEST_USER;
    let page = parseInt(req.query.page) || 1;
    let total = parseInt(req.query.limit) || 10;
    let status = req.query.status || 'planning'; // only planning or watched
    let sort = req.query.sort || 'priority_asc';
    const search = (req.query.search || '').toString().trim();

    let settings = {};
    switch (sort) {
        case 'priority_asc': settings.priority = 1; break;
        case 'priority_desc': settings.priority = -1; break;
        // case 'title_asc': settings.title = 1; break;
        // case 'title_desc': settings.title = -1; break;
        case 'date_asc': settings.createdAt = 1; break;
        case 'date_desc': settings.createdAt = -1; break;
        default: settings.priority = 1;
    }
    // settings = {
    //     priority: 1, // ascending
    //     createdAt: 0, // unset
    //     title: 0 // unset
    // };

    // action
    const editMovieId = req.query.edit || null;
    const removeMovieId = req.query.remove || null;

    try {
        if (!editMovieId && !removeMovieId) {
            let watchlist = await List.getListsByUser(user, page, total, status, settings, search);
            return res.render("watchlist", { watchlist, page, total, status, sort, search, editMovieId, removeMovieId });
        }

        const movieId = editMovieId || removeMovieId;
        const movie = await List.getWatchlistItem(user, movieId);

        if (!movie) return res.status(404).send("Movie not found in watchlist");

        return res.render("watchlist", { editMovieId, removeMovieId, movie });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// todo getMovieStatus
exports.getMovieStatus = async (req, res) => {
    // const { userId, movieId } = req.params;
    const user = (req.session && req.session.user) || TEST_USER;
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
    const user = (req.session && req.session.user) || TEST_USER;
    const movie = req.body.movieId;
    const update = {
        status: req.body.status || null,
        notes: req.body.notes || null,
        priority: parseInt(req.body.priority, 10) || null
    };

    try {
        const status = await List.updateWatchlistMovie(user, movie, update);
        console.log(status);
        // res.status(200).json(status);
        return res.redirect('/list');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// addToUserList // userid, movieid, listtype, info
exports.addToUserList = async (req, res) => {
    const user = (req.session && req.session.user) || TEST_USER;
    movie = '69c39ce645385a80651325f7';
    list = 'planning';
    notes = null;
    try {
        let newItem = await List.createUserList(user, movie, list, notes);
        res.status(200).json({ newItem });
        // res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// deleteFromUserL ist // userid, movieid
exports.deleteFromUserList = async (req, res) => {
    const user = (req.session && req.session.user) || TEST_USER;
    const movie = req.body.movieId;

    try {
        await List.deleteFromUserList(user, movie);
        // res.status(200).json('success');
        return res.redirect('/list');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};