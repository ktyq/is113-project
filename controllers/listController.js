const fs = require('fs/promises');

const List = require('../models/Watchlist');
const User = require('../models/user');
const Friend = require('../models/Friend');
const TEST_USER = '69c39ce645385a80651325ed';

// Helper function to resolve current user ID from various sources
// FIX: Guard req.body, and extract .id from session.user object instead of returning the whole object
async function resolveCurrentUser(req) {
    if (req.session && req.session.user) {
        const sid = req.session.user.id || req.session.user._id;
        if (sid) return typeof sid === 'object' ? sid.toString() : sid;
    }
    if (req.query && req.query.userId) return req.query.userId;
    if (req.body && req.body.userId) return req.body.userId;

    const firstUser = await User.findOne({});
    return firstUser ? firstUser._id.toString() : TEST_USER;
}

// viewUserList
exports.viewUserList = async (req, res) => {
    const user = (req.session && req.session.user && (req.session.user.id || req.session.user._id)) || TEST_USER;
    let page = parseInt(req.query.page) || 1;
    let total = parseInt(req.query.limit) || 10;
    let status = req.query.status || 'planning';
    let sort = req.query.sort || 'priority_asc';
    const search = (req.query.search || '').toString().trim();

    let settings = {};
    switch (sort) {
        case 'priority_asc': settings.priority = 1; break;
        case 'priority_desc': settings.priority = -1; break;
        case 'date_asc': settings.createdAt = 1; break;
        case 'date_desc': settings.createdAt = -1; break;
        default: settings.priority = 1;
    }

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

// viewOtherUserList - view another user's watchlist with privacy check
exports.viewOtherUserList = async (req, res) => {
    const targetUserId = req.params.userId;
    const currentUserId = await resolveCurrentUser(req);

    try {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).send('User not found');

        // If viewing own list, redirect to /list
        if (targetUserId === currentUserId) {
            return res.redirect('/list');
        }

        // Check privacy settings
        if (targetUser.watchlistPrivacy === 'private') {
            return res.status(403).send('This user\'s watchlist is private');
        }

        if (targetUser.watchlistPrivacy === 'friends') {
            const friendship = await Friend.findOne({
                $or: [
                    { requestor: currentUserId, requestee: targetUserId },
                    { requestor: targetUserId, requestee: currentUserId }
                ],
                status: 'accepted'
            });
            if (!friendship) {
                return res.status(403).send('This user\'s watchlist is only visible to friends');
            }
        }

        let page = parseInt(req.query.page) || 1;
        let total = parseInt(req.query.limit) || 10;
        let status = req.query.status || 'planning';
        let sort = req.query.sort || 'priority_asc';
        const search = (req.query.search || '').toString().trim();

        let settings = {};
        switch (sort) {
            case 'priority_asc': settings.priority = 1; break;
            case 'priority_desc': settings.priority = -1; break;
            case 'date_asc': settings.createdAt = 1; break;
            case 'date_desc': settings.createdAt = -1; break;
            default: settings.priority = 1;
        }

        let watchlist = await List.getListsByUser(targetUserId, page, total, status, settings, search);
        return res.render("watchlist", {
            watchlist,
            page,
            total,
            status,
            sort,
            search,
            editMovieId: null,
            removeMovieId: null,
            viewingUser: targetUser
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// getMovieStatus
exports.getMovieStatus = async (req, res) => {
    const user = (req.session && req.session.user && (req.session.user.id || req.session.user._id)) || TEST_USER;
    const movie = '69c39ce645385a80651325f7';

    try {
        const status = await List.getMovieStatus(user, movie);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// editUserListItem
exports.editUserListItem = async (req, res) => {
    const user = (req.session && req.session.user && (req.session.user.id || req.session.user._id)) || TEST_USER;
    const movie = req.body.movieId;
    const update = {
        status: req.body.status || null,
        notes: req.body.notes || null,
        priority: parseInt(req.body.priority, 10) || null
    };

    try {
        const status = await List.updateWatchlistMovie(user, movie, update);
        console.log(status);
        return res.redirect('/list');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// addToUserList
exports.addToUserList = async (req, res) => {
    const user = (req.session && req.session.user && (req.session.user.id || req.session.user._id)) || TEST_USER;
    const movie = '69c39ce645385a80651325f7';
    const list = 'planning';
    const notes = null;

    try {
        let newItem = await List.createUserList(user, movie, list, notes);
        res.status(200).json({ newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// deleteFromUserList
exports.deleteFromUserList = async (req, res) => {
    const user = (req.session && req.session.user && (req.session.user.id || req.session.user._id)) || TEST_USER;
    const movie = req.body.movieId;

    try {
        await List.deleteFromUserList(user, movie);
        return res.redirect('/list');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};