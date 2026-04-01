// data/testData.js
// testData.js

const users = [
    {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        accountStatus: 'active',
        watchlistPrivacy: 'friends'
    },
    {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        accountStatus: 'active',
        watchlistPrivacy: 'friends'
    },
    {
        username: 'admin_user',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        accountStatus: 'active',
        watchlistPrivacy: 'private'
    }
];

const movies = [
    {
        title: 'Inception',
        imageRef: 'inception.jpg',
        movieLength: 148,
        release_year: 2010,
        genre: ['Sci-Fi', 'Action'],
        overview: 'A thief enters dreams to steal secrets.',
        director: ['Christopher Nolan'],
        cast: ['Leonardo DiCaprio']
    },
    {
        title: 'Interstellar',
        imageRef: 'interstellar.jpg',
        movieLength: 169,
        release_year: 2014,
        genre: ['Sci-Fi', 'Drama'],
        overview: 'A journey through space to save humanity.',
        director: ['Christopher Nolan'],
        cast: ['Matthew McConaughey']
    },
    {
        title: 'The Dark Knight',
        imageRef: 'dark_knight.jpg',
        movieLength: 152,
        release_year: 2008,
        genre: ['Action', 'Crime'],
        overview: 'Batman faces the Joker.',
        director: ['Christopher Nolan'],
        cast: ['Christian Bale']
    },
    {
        title: 'Pulp Fiction',
        imageRef: 'pulp_fiction.jpg',
        movieLength: 154,
        release_year: 1994,
        genre: ['Crime', 'Drama'],
        overview: 'Interwoven crime stories.',
        director: ['Quentin Tarantino'],
        cast: ['John Travolta']
    },
    {
        title: 'Fight Club',
        imageRef: 'fight_club.jpg',
        movieLength: 139,
        release_year: 1999,
        genre: ['Drama'],
        overview: 'An underground fight club forms.',
        director: ['David Fincher'],
        cast: ['Brad Pitt']
    },
    {
        title: 'Forrest Gump',
        imageRef: 'forrest_gump.jpg',
        movieLength: 142,
        release_year: 1994,
        genre: ['Drama'],
        overview: 'Life journey of Forrest.',
        director: ['Robert Zemeckis'],
        cast: ['Tom Hanks']
    },
    {
        title: 'The Matrix',
        imageRef: 'matrix.jpg',
        movieLength: 136,
        release_year: 1999,
        genre: ['Sci-Fi'],
        overview: 'Reality is a simulation.',
        director: ['Wachowski Sisters'],
        cast: ['Keanu Reeves']
    },
    {
        title: 'Gladiator',
        imageRef: 'gladiator.jpg',
        movieLength: 155,
        release_year: 2000,
        genre: ['Action'],
        overview: 'A Roman general seeks revenge.',
        director: ['Ridley Scott'],
        cast: ['Russell Crowe']
    },
    {
        title: 'Titanic',
        imageRef: 'titanic.jpg',
        movieLength: 195,
        release_year: 1997,
        genre: ['Romance'],
        overview: 'A love story on a sinking ship.',
        director: ['James Cameron'],
        cast: ['Leonardo DiCaprio']
    },
    {
        title: 'Avatar',
        imageRef: 'avatar.jpg',
        movieLength: 162,
        release_year: 2009,
        genre: ['Sci-Fi'],
        overview: 'Humans explore Pandora.',
        director: ['James Cameron'],
        cast: ['Sam Worthington']
    },
    {
        title: 'Whiplash',
        imageRef: 'whiplash.jpg',
        movieLength: 107,
        release_year: 2014,
        genre: ['Drama'],
        overview: 'A drummer faces a strict teacher.',
        director: ['Damien Chazelle'],
        cast: ['Miles Teller']
    },
    {
        title: 'The Social Network',
        imageRef: 'social_network.jpg',
        movieLength: 120,
        release_year: 2010,
        genre: ['Drama'],
        overview: 'The rise of Facebook.',
        director: ['David Fincher'],
        cast: ['Jesse Eisenberg']
    },
    {
        title: 'Parasite',
        imageRef: 'parasite.jpg',
        movieLength: 132,
        release_year: 2019,
        genre: ['Thriller'],
        overview: 'A poor family infiltrates a rich one.',
        director: ['Bong Joon-ho'],
        cast: ['Song Kang-ho']
    },
    {
        title: 'Joker',
        imageRef: 'joker.jpg',
        movieLength: 122,
        release_year: 2019,
        genre: ['Drama'],
        overview: 'Origin of the Joker.',
        director: ['Todd Phillips'],
        cast: ['Joaquin Phoenix']
    },
    {
        title: 'The Avengers',
        imageRef: 'avengers.jpg',
        movieLength: 143,
        release_year: 2012,
        genre: ['Action'],
        overview: 'Heroes unite to save Earth.',
        director: ['Joss Whedon'],
        cast: ['Robert Downey Jr.']
    }
];

const watchlistData = [
    // john_doe (6 movies)
    { username: 'john_doe', movieTitle: 'Inception', status: 'planning', priority: 2 },
    { username: 'john_doe', movieTitle: 'Interstellar', status: 'watched', priority: 5 },
    { username: 'john_doe', movieTitle: 'Fight Club', status: 'planning', priority: 3 },
    { username: 'john_doe', movieTitle: 'The Matrix', status: 'watched', priority: 4 },
    { username: 'john_doe', movieTitle: 'Gladiator', status: 'planning', priority: 1 },
    { username: 'john_doe', movieTitle: 'Whiplash', status: 'planning', priority: 2 },

    // jane_smith (7 movies)
    { username: 'jane_smith', movieTitle: 'Titanic', status: 'watched', priority: 3 },
    { username: 'jane_smith', movieTitle: 'Avatar', status: 'planning', priority: 2 },
    { username: 'jane_smith', movieTitle: 'Parasite', status: 'watched', priority: 5 },
    { username: 'jane_smith', movieTitle: 'Joker', status: 'planning', priority: 4 },
    { username: 'jane_smith', movieTitle: 'The Dark Knight', status: 'watched', priority: 5 },
    { username: 'jane_smith', movieTitle: 'Pulp Fiction', status: 'planning', priority: 3 },
    { username: 'jane_smith', movieTitle: 'The Social Network', status: 'planning', priority: 2 }
];

const friendsData = [
    {
        requestorUsername: 'john_doe',
        requesteeUsername: 'jane_smith',
        status: 'accepted'
    }
];

module.exports = {
    users,
    movies,
    watchlistData,
    friendsData
};