// seed.js
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require('mongoose');

const User = require('../models/user');
const Movie = require('../models/Movie');
const Watchlist = require('../models/Watchlist');
const Friend = require('../models/Friend');

const { users, movies, watchlistData, friendsData } = require('./testData');

async function seedDatabase() {
    try {
        const dbURI = process.env.DB;
        await mongoose.connect(dbURI);
        console.log('✅ Connected to MongoDB\n');

        // CLEAR DATABASE
        console.log('🗑️ Clearing database...');
        await Promise.all([
            User.deleteMany({}),
            Movie.deleteMany({}),
            Watchlist.deleteMany({}),
            Friend.deleteMany({})
        ]);
        console.log('✅ All collections cleared\n');

        // CREATE USERS
        console.log('👥 Creating users...');
        const createdUsers = await User.insertMany(users);

        const userMap = {};
        createdUsers.forEach(u => {
            userMap[u.username] = u._id;
            console.log(`   ✅ ${u.username}`);
        });

        // CREATE MOVIES (addedBy = admin)
        console.log('\n🎬 Creating movies...');
        const adminUser = createdUsers.find(u => u.role === 'admin');

        const moviesWithAdmin = movies.map(m => ({
            ...m,
            addedBy: adminUser._id
        }));

        const createdMovies = await Movie.insertMany(moviesWithAdmin);

        const movieMap = {};
        createdMovies.forEach(m => {
            movieMap[m.title] = m._id;
            console.log(`   ✅ ${m.title}`);
        });

        // CREATE WATCHLIST
        console.log('\n📋 Creating watchlist...');
        const watchlistEntries = [];

        for (const item of watchlistData) {
            const userId = userMap[item.username];
            const movieId = movieMap[item.movieTitle];

            if (userId && movieId) {
                watchlistEntries.push({
                    userID: userId,
                    movieID: movieId,
                    status: item.status,
                    notes: item.notes || '',
                    priority: item.priority
                });
            } else {
                console.log(`   ⚠️ Skipped: ${item.username} - ${item.movieTitle}`);
            }
        }

        if (watchlistEntries.length > 0) {
            await Watchlist.insertMany(watchlistEntries);
            console.log(`✅ ${watchlistEntries.length} watchlist entries created`);
        }

        // CREATE FRIENDS
        console.log('\n🤝 Creating friendships...');
        const friendEntries = [];

        for (const f of friendsData) {
            const requestor = userMap[f.requestorUsername];
            const requestee = userMap[f.requesteeUsername];

            if (requestor && requestee) {
                friendEntries.push({
                    requestor,
                    requestee,
                    status: f.status,
                    friendsSince: f.status === 'accepted' ? new Date() : null
                });
            } else {
                console.log(`   ⚠️ Skipped friendship: ${f.requestorUsername} - ${f.requesteeUsername}`);
            }
        }

        if (friendEntries.length > 0) {
            await Friend.insertMany(friendEntries);
            console.log(`✅ ${friendEntries.length} friendships created`);
        }

        // FINAL STATS
        console.log('\n📊 FINAL STATS');
        console.log(`Users: ${await User.countDocuments()}`);
        console.log(`Movies: ${await Movie.countDocuments()}`);
        console.log(`Watchlist: ${await Watchlist.countDocuments()}`);
        console.log(`Friends: ${await Friend.countDocuments()}`);

        console.log('\n✅ Seeding completed');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
}

seedDatabase();