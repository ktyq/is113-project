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
    secret: process.env.SECRET, 
    resave: false, 
    saveUninitialized: false  
}));
server.get("/", (req, res) => res.status(200).send(`success!`));

// routes
server.use("/", require("./routes/profile"));
server.use("/list", require("./routes/watchlist"));
server.use("/reviews", require("./routes/reviews"));
server.use("/friends", require("./routes/friends"));
server.use('/admin', require('./routes/movies'));
server.use('/movie', require('./routes/index'));
server.use('/index', require('./routes/index'));

// Direct profile view route (for viewing other users' profiles via friends)
server.get('/friends/profile/:userId', require('./controllers/friendController').viewUserProfile);

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
