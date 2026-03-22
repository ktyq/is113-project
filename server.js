const express = require('express')
const path = require('path')
const server = express();

server.use("/", express.static(path.join(__dirname, "public")))
server.use(express.urlencoded({ extended: true }));

server.get('/', (req, res) => {
    res.status(200).send(`success!`)
});

// set path
server.use('/watchlist', require('./routes/watchlist'));
server.use('/feedback', require('./routes/feedback'));
server.set("view engine", "ejs");
server.get('/watchlist', (req, res) => {
    const errors = [];
    res.render('watchlist', {});
});

const hostname = 'localhost'
const port = 8000
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
    console.log(`dirname: ${__dirname}`)
})