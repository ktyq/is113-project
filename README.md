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
- **Frontend**: HTML
- **Templates**: EJS
- **Environment**: Node.js

## Project Structure

## Installation
1. Clone the repository
2. Install dependencies
3. Set up MongoDB
4. Import data
5. Start application
6. Launch browser

## Usage

## API Endpoints

-



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