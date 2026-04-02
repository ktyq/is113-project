# MOVIE WATCHLIST & REVIEW HUB
Full-stack web application which allows users can add movies to a personal watchlist, mark them as watched, and leave reviews/ratings. 

## Features
- **User Account**: Register as new user, log in/out, update and delete profile
- **Watchlist Privacy**: Set watchlist visibility to public, private, or to friends only
- **Browse Movies**: Search and filter movies on the home page
- **Add Friends**: Add other users as friends
- **View Movie**: View movie details and reviews
- **Leave Reviews**: Add review and ratings to a movie
- **Watchlist**: Add movies to personal watchlist (watched, planning to watch)
- **Add new movies**: Admin user can add new movies

## Tech Stack
- **Backend**: Express.js with MVC architecture
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML with minimal CSS
- **Templates**: EJS
- **Environment**: Node.js

## Project Structure

is113-project/  
├── controllers/          # MVC Controllers  
│   ├── feedbackController.js  
│   ├── friendController.js  
│   ├── indexController.js  
│   ├── listController.js  
│   ├── movieController.js  
│   ├── reviewController.js  
│   └── userController.js  
├── middleware/           # utility functions  
│   └── authentication.js  
├── models/               # MongoDB Models  
│   ├── Feedback.js  
│   ├── Friend.js  
│   ├── movie.js  
│   ├── review.js  
│   ├── user.js  
│   └── watchlist.js  
├── public/               # static assets  
│   ├── default.css  
│   ├── js/  
│   └── uploads/  
│       ├── avatar.jpg  
│       ├── avengers.jpg  
│       ├── fight_club.webp  
│       ├── forrest_gump.jpg  
│       ├── gladiator.png  
│       ├── inception.jpg  
│       ├── interstellar.jpg  
│       ├── joker.jpg  
│       ├── parasite.jpg  
│       ├── pulp_fiction.jpg  
│       ├── the_avengers.jpg  
│       ├── the_dark_knight.jpg  
│       ├── the_matrix.jpg  
│       ├── the_social_network.jpg  
│       ├── titanic.jpg  
│       └── whiplash.jpg  
├── routes/               # Express Routes  
│   ├── feedback.js  
│   ├── friends.js  
│   ├── index.js  
│   ├── movies.js  
│   ├── profile.js  
│   ├── reviews.js  
│   └── watchlist.js  
├── views/                # EJS Templates  
│   ├── partial/  
│   │   ├── header.ejs  
│   │   ├── messages.ejs  
│   │   ├── watchlist-edit.ejs  
│   │   └── watchlist-row.ejs  
│   ├── admin.ejs  
│   ├── admin-feedback.ejs  
│   ├── browse-users.ejs  
│   ├── edit-profile.ejs  
│   ├── editMovie.ejs  
│   ├── feedback.ejs  
│   ├── friends.ejs  
│   ├── index.ejs  
│   ├── login.ejs  
│   ├── manage-accounts.ejs  
│   ├── movie.ejs  
│   ├── profile.ejs  
│   ├── register.ejs  
│   ├── review.ejs  
│   └── watchlist.ejs  
├── server.js             # Main application file  
├── package.json  
├── package-lock.json  
├── config.env            # Environment variables  
└── README.md  

Models: Define data structures in the models/ directory  
Controllers: Handle business logic in the controllers/ directory  
Routes: Define API endpoints in the routes/ directory  
Views: Create EJS templates in the views/ directory  
Public: Access public files in the public/ directory  

## Installation
1. Clone the repository
2. Install dependencies
3. Set up MongoDB
4. Import data
5. Start application
6. Launch browser

## API Endpoints

GET /reviews - Get all reviews
GET /reviews/create - Get review form to provide review
POST /reviews/create - Create new review

server.use("/", require("./routes/profile"));
server.use('/index', require('./routes/index'));
server.use("/list", require("./routes/watchlist"));
server.use("/reviews", require("./routes/reviews"));

server.use("/friends", require("./routes/friends"));
server.use('/admin', require('./routes/movies'));
server.use('/feedback', require("./routes/feedback"));



## Database Schema

![Schema](assets/mongodb-database.png)

<details>
<summary>userSchema</summary>

* **_id**: ObjectId  
* **username**: String  
* **email**: String  
* **password**: String (hashed)  
* **isAdmin**: Boolean  
* **accountStatus**: String (`active`, `suspended`, `disabled`)  
* **watchlistPrivacy**: String (`public`, `friends`, `private`)  
* **createdAt**: Date  
* **updatedAt**: Date  

</details>

<details>
<summary>friendSchema</summary>

* **_id**: ObjectId  
* **requestor**: ObjectId (references User)  
* **requestee**: ObjectId (references User)  
* **nickname1**: String  
* **nickname2**: String  
* **status**: String (`pending`, `accepted`)  
* **friendsSince**: Date  
* **createdAt**: Date  
* **updatedAt**: Date  

</details>

<details>
<summary>watchlistSchema</summary>

* **_id**: ObjectId  
* **userID**: ObjectId (references User)  
* **movieID**: ObjectId (references Movie)  
* **status**: String (`planning`, `watched`)  
* **notes**: String (max 256 characters)  
* **priority**: Number  
* **createdAt**: Date  
* **updatedAt**: Date  

</details>

<details>
<summary>movieSchema</summary>

* **_id**: ObjectId  
* **title**: String  
* **imageRef**: String (image file reference)  
* **movieLength**: Number (minutes)  
* **releaseYear**: String  
* **genre**: [String]  
* **overview**: String  
* **director**: [String]  
* **cast**: [String]  
* **addedBy**: ObjectId (references User)  
* **createdAt**: Date  
* **updatedAt**: Date  

</details>

<details>
<summary>reviewSchema</summary>

* **_id**: ObjectId  
* **userID**: ObjectId (references User)  
* **movieID**: ObjectId (references Movie)  
* **rating**: Number (1–5)  
* **comment**: String (max 8000 characters)  
* **isAnonymous**: Boolean  
* **createdAt**: Date  
* **updatedAt**: Date  

</details>

<details>
<summary>formSchema</summary>

* **_id**: ObjectId  
* **sentBy**: ObjectId (references User)  
* **type**: String (`feedback`, `bug`, `report`)  
* **status**: String (`pending`, `resolved`)  
* **url**: String  
* **notes**: String (max 256 characters)  
* **createdAt**: Date  
* **updatedAt**: Date  

</details>

## AI Declaration
- Generating boilerplate code for frontend ejs files
- Generating sample database data and script for automatic populating of data
- 
