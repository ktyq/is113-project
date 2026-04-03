const List = require('../models/Watchlist');
const User = require('../models/User');
const Friend = require('../models/Friend');
const { Types } = require('mongoose');
async function checkUserPrivacy(targetUserId, currentUserId) {
    try {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return { error: 'User not found' };

        if (targetUser.watchlistPrivacy === 'private') {
            return { error: 'This user\'s watchlist is private' };
        }

        if (targetUser.watchlistPrivacy === 'friends') {
            if (!currentUserId) {
                return { error: 'This user\'s watchlist is only visible to friends' };
            }

            const friendship = await Friend.findOne({
                $or: [
                    { requestor: new Types.ObjectId(currentUserId), requestee: new Types.ObjectId(targetUserId) },
                    { requestor: new Types.ObjectId(targetUserId), requestee: new Types.ObjectId(currentUserId) }
                ],
                status: 'accepted'
            });

            if (!friendship) {
                return { error: 'This user\'s watchlist is only visible to friends' };
            }
        }
        return { error: null, user: targetUser };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to check user watchlist privacy' };
    }
}

// viewUserList
exports.viewUserList = async (req, res) => {
    const user = req.session?.user?.id || req.session?.user?._id || null;
    let page = parseInt(req.query.page) || 1;
    let total = parseInt(req.query.limit) || 10;
    let status = req.query.status || 'planning';
    let sort = req.query.sort || 'priority_asc';
    const search = (req.query.search || '').toString().trim();
    let watchlist = null;
    let errors = req.query.error || null;
    console.log(errors);
    let settings = {};
    switch (sort) {
        case 'priority_asc': settings.priority = 1; break;
        case 'priority_desc': settings.priority = -1; break;
        case 'date_asc': settings.createdAt = 1; break;
        case 'date_desc': settings.createdAt = -1; break;
        default: settings.priority = 1;
    }
    const targetUserId = req.query.userId || null;
    const currentUserId = user;

    let editMovieId = req.query.edit || null;
    let removeMovieId = req.query.remove || null;

    // prevent editing/removing if viewing another user's list
    if (targetUserId && targetUserId !== currentUserId) {
        editMovieId = null;
        removeMovieId = null;
    }

    try {
        if (targetUserId && targetUserId != currentUserId) {
            const friendship = await checkUserPrivacy(targetUserId, currentUserId);

            if (friendship.error) {
                return res.render("watchlist", {
                    watchlist,
                    page,
                    total,
                    status,
                    sort,
                    search,
                    editMovieId: null,
                    removeMovieId: null,
                    viewingUser: friendship.user,
                    user,
                    errors: friendship.error, success: null, private: true
                });
            }
            // allowed
            watchlist = await List.getListsByUser(targetUserId, page, total, status, settings, search);
            return res.render("watchlist", {
                watchlist,
                page,
                total,
                status,
                sort,
                search,
                editMovieId: null,
                removeMovieId: null,
                viewingUser: friendship.user,
                user,
                errors, success: null, private: null
            });
        }

        if (!editMovieId && !removeMovieId) {
            watchlist = await List.getListsByUser(user, page, total, status, settings, search);
            return res.render("watchlist", {
                watchlist, page, total, status, sort, search, editMovieId, removeMovieId, viewingUser: null, user: req.session.user || null, errors, success: null, private: false
            });
        }

        const movieId = editMovieId || removeMovieId;
        const movie = await List.getWatchlistItem(user, movieId);
        if (!movie) return res.status(404).send("Movie not found in watchlist");

        return res.render("watchlist", { editMovieId, removeMovieId, movie, viewingUser: null, user: req.session.user || null, errors: null, success: null, private: false });

    } catch (error) {
        console.log(error.message);
        return res.render("watchlist", {
            watchlist,
            page,
            total,
            status,
            sort,
            search,
            editMovieId: null,
            removeMovieId: null,
            viewingUser: null,
            user,
            errors: "Failed to fetch user watchlist.",
            success: null, private: false
        });
        // res.status(500).json({ error: error.message });
    }
};

// getMovieStatus
exports.getMovieStatus = async (req, res) => {
    const user = req.session?.user?.id || req.session?.user?._id || null;
    const movie = req.body.movieId;

    try {
        const status = await List.getMovieStatus(user, movie);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ errors: "Could not get movie watch status." });
    }
};

// editUserListItem
exports.editUserListItem = async (req, res) => {
    const user = req.session?.user?.id || req.session?.user?._id || null;
    const movie = req.body.movieId;
    let existing = null;
    const update = {
        status: req.body.status || null,
        notes: req.body.notes || null,
        priority: parseInt(req.body.priority, 10) || null
    };

    try {
        // check if movie already exists in watchlist
        existing = await List.getWatchlistItem(user, movie);

        if (existing) {
            await List.updateWatchlistMovie(user, movie, update);
        } else {
            await List.createUserList(user, movie, update.status || 'planning');
        }
        return res.redirect('/list');
    } catch (error) {
        res.redirect('/list?error=' + encodeURIComponent("Failed to edit watchlist item"));
    }
};

// addToUserList
exports.addToUserList = async (req, res) => {
    const user = req.session?.user?.id || req.session?.user?._id || null;
    const movie = req.body.movieId;
    const list = 'planning';
    const notes = null;

    try {
        let newItem = await List.createUserList(user, movie, list, notes);
        res.redirect('/list');
    } catch (error) {
        res.status(500).json({ errors: `Failed to add movie to watchlist.` });
    }
};

// deleteFromUserList
exports.deleteFromUserList = async (req, res) => {
    const user = req.session?.user?.id || req.session?.user?._id || null;
    const movie = req.body.movieId;
    let existing = null;

    try {
        existing = await List.getWatchlistItem(user, movie);
        if (!existing) {
            throw new Error("Movie does not exist.");
        }
        await List.deleteFromUserList(user, movie);
        return res.redirect('/list');
    } catch (error) {
        res.redirect('/list?error=' + encodeURIComponent("Failed to delete watchlist item"));
    }
};