// models/Watchlist.js

// watchlistSchema
// _id: ObjectId
// userID: ObjectId
// movieID: ObjectId
// status: String ['planning', 'watched']
// notes: String [max: 256]
// priority: Number
// createdAt: Date
// updatedAt: Date

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
require('./Movie');
require('./User');

const watchlistSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    movieID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Movie is required'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['planning', 'watched'],
            message: "Status must be 'planning' or 'watched'"
        },
        default: 'planning'
    },
    notes: {
        type: String,
        maxLength: [256, 'Notes cannot exceed 256 characters'],
        default: ''
    },
    priority: {
        type: Number,
        min: [0, 'Priority cannot be negative'],
        max: [999, 'Priority cannot exceed 999'],
        default: 0
    },
},
    { timestamps: true }
);

// prevent suplicate entries
watchlistSchema.index({ userID: 1, movieID: 1 }, { unique: true });
watchlistSchema.index({ userID: 1, status: 1, priority: -1 });

// reed
watchlistSchema.statics.getListsByUser = async function (user, page = 1, number = 10, status = null, settings = null, search = '') {
    const userID = typeof user === 'string' ? new ObjectId(user) : user;

    let query = { userID };
    if (status === 'planning' || status === 'watched') { query.status = status; }

    let sortObj = { priority: -1 }; // default

    if (settings) {
        if (settings.priority === 1 || settings.priority === -1) {
            sortObj = { priority: settings.priority }; // 1. lowest first | -1. highest first
            // } else if (settings.title === 1 || settings.title === -1) {
            //     sortObj = { 'movieID.title': settings.title }; // alphabetical |  reverse alphabetical
        } else if (settings.createdAt === 1 || settings.createdAt === -1) {
            sortObj = { createdAt: settings.createdAt }; // oldest first
        }
    }

    let result = await Watchlist
        .find(query)
        .limit(number)
        .skip((page - 1) * number)
        .sort(sortObj)
        .populate({
            path: 'movieID',
            select: 'title director',
            match: search && search.trim() !== '' ? { title: { $regex: search.trim(), $options: 'i' } } : {}
        })
        .lean();

    result = result.filter(item => item.movieID); // remove non matching titles
    // console.log('Titles:', result.map(item => item.movieID?.title));
    return result;
};

// reed
watchlistSchema.statics.getWatchlistItem = async function (user, movie) {
    const userID = typeof user === 'string' ? new ObjectId(user) : user;
    const movieID = typeof movie === 'string' ? new ObjectId(movie) : movie;

    const result = await Watchlist
        .findOne({ userID, movieID })
        .populate({
            path: 'movieID',
            select: 'title',
        })
        .lean();
    return result || null;
};
watchlistSchema.statics.getMovieStatus = async function (user, movie) {
    const userID = typeof user === 'string' ? new ObjectId(user) : user;
    const movieID = typeof movie === 'string' ? new ObjectId(movie) : movie;

    const entry = await Watchlist
        .findOne({ userID, movieID })
        .select('status')
        .lean();
    return entry?.status || null;
};
// updat
watchlistSchema.statics.updateWatchlistMovie = async function (user, movie, updates) {
    const userID = typeof user === 'string' ? new ObjectId(user) : user;
    const movieID = typeof movie === 'string' ? new ObjectId(movie) : movie;
    const { status, priority, notes } = updates;

    const updateFields = {};

    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;
    if (notes !== undefined) updateFields.notes = notes;

    if (Object.keys(updateFields).length === 0) { throw new Error('No fields provided'); }

    return await Watchlist
        .findOneAndUpdate(
            { userID, movieID },
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate('movieID', 'title');
};

// creat
watchlistSchema.statics.createUserList = async function (user, movie, status = 'planning') {
    const userID = typeof user === 'string' ? new ObjectId(user) : user;
    const movieID = typeof movie === 'string' ? new ObjectId(movie) : movie;

    // Check if already exists
    const exists = await Watchlist.findOne({ userID, movieID });
    if (exists) { throw new Error('Movie already in watchlist'); }

    const newEntry = await Watchlist.create({ userID, movieID, status });
    return await newEntry.populate('movieID', 'title');
};

// delet
watchlistSchema.statics.deleteFromUserList = async function (user, movie) {
    const userID = typeof user === 'string' ? new ObjectId(user) : user;
    const movieID = typeof movie === 'string' ? new ObjectId(movie) : movie;

    const result = await this.deleteOne({ userID, movieID });
    if (result.deletedCount === 0) { throw new Error('Movie not found in watchlist'); }

    return result;
};

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist; // blehhhh 