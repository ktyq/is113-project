const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const path = require("path");
// const fs = require('fs');

const friendController = require("./controllers/friendController");
const server = express();
server.set("view engine", "ejs");
server.set('views', path.join(__dirname, 'views')); 

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use("/", express.static(path.join(__dirname, "public")));
server.use(express.json());

server.use(session({
    secret: process.env.SECRET, // sign the session ID cookie. should be a long, random, and secure string, preferably stored in an environment variable
    resave: false,  // Prevents the session from being saved back to the session store if nothing has changed.
    saveUninitialized: false  // Prevents a new, empty session from being saved to the store.
}));
server.get("/", (req, res) => res.status(200).send(`success!`));

// routes
server.use("/", require("./routes/profile"));
// server.use("/list", require("./routes/watchlist"));
// server.use("/reviews", require("./routes/reviews"));
// server.use("/friends", require("./routes/friends"));
// server.use('/admin', require('./routes/movies'));
// server.use('/movie', require('./routes/index'));
// server.use('/index', require('./routes/index'));

// server.get('/watchlist/:friendId', friendController.viewFriendWatchlist);

async function connectDB() {
  try {
    // connecting to Database with our config.env file and DB is constant in config.env
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = 8000; // Define port number

  // Start the server and listen on the specified hostname and port
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

connectDB().then(startServer);
