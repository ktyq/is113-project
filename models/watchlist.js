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

const watchlistSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    movieID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Movie is required'],
        // unique: true
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
        maxLength: [256, 'Notes cannot exceed 256 characters']
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

// U: update watch list
// D: delete movie/ watchlist
const Watchlist = mongoose.model('Watchlist', watchlistSchema);

exports.getListsByUser = function (userid, status) {
    // GET /lists/{user} (get user lists)
};

exports.getMovieStatus = function (userid, movie) {
    // GET /lists/{user}/{movie} (get user movie list)
};

exports.updateWatchlistMovie = async function (userid, movie, status, priority, notes) {
    // PUT /lists/{user}/{movie}/{status}
    // const customer = await Watchlist.findOne({ _id: customerId });
    // return Watchlist.updateOne({ _id: customerId }, { orderHistory: orderHistory });
};
