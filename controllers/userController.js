const User = require('../models/user');
const bcrypt = require('bcrypt'); 

//--REGISTER--//
exports.registerGet = (req, res) => {
    res.render('register', {error: null});
}

exports.registerPost = async(req, res) => {
    try {
        const {username, email, password, confirmPassword,role} = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.render('register', {error: 'All fields are required'});
        }

        if (password !== confirmPassword) {
            return res.render('register', {error: 'Passwords do not match'});
        }

        //Check if username or email already exists
        const existingUser = await User.findOne({$or: [{username: username}, {email: email}]});
        if (existingUser) {
            return res.render('register', {error: 'Username or email already exists'});
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User ({
            username: username,
            email: email,
            password: hashedPassword,
            role: role
        });

        await user.save();
        console.log("User registered:", user.username, user.role);
        res.redirect('/login');     

    } catch(err) {
        console.error(err);
        res.render('register', {error: 'An error occurred. Please try again.', success: null});
    }
}

//--LOGIN--//
exports.loginGet = (req, res) => {
    res.render('login', {error: null});
}

exports.loginPost = async(req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.render('login', {error: 'All fields are required'});
    }

    try {
        const user = await User.findOne({email: email});
        if (!user) {
            return res.render('login', {error: 'Invalid email or password'});
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login', {error: 'Invalid email or password'});
        }

        // Store user info in session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
        console.log("User logged in:", user.username, user.role);

        // Redirect based on role
        if(user.role === "admin") {
            return res.redirect('/admin-profile');
        }
        res.redirect('/index');

    } catch(err) {
        console.error(err.message);
        res.render('login', {error: 'An error occurred. Please try again.'});
    }
}

//--GET PROFILE--//
exports.profile = (req, res) => {
    res.render('user-profile', {user: req.session.user});
}

exports.adminProfile = (req, res) => {
    res.render('admin-profile', {user: req.session.user})
}

//--UPDATE PROFILE--//
exports.editProfileGet = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('edit-profile', {user: user, error: null});
    } catch(err) {
        console.error(err);
        res.redirect('/user-profile');
    }
}

exports.editProfilePost = async(req, res) => {
    try {
        const {username, email, currentPassword, newPassword, confirmNewPassword, watchlistPrivacy} = req.body; // Added watchlistPrivacy
        const user = await User.findById(req.session.user.id);

        if (!user) return res.redirect('/login');

        //Check new username not taken by others
        if (username !== user.username) {
            const taken = await User.findOne({username: username});
            if(taken) {
                return res.render('edit-profile', {user: user, error: 'Username already taken'});
            }
        }
        
        //Check new email not taken by others
        if (email !== user.email) {
            const taken = await User.findOne({email: email});
            if(taken) {
                return res.render('edit-profile', {user: user, error: 'Email already taken'});
            }            
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.watchlistPrivacy = watchlistPrivacy || user.watchlistPrivacy; // Update privacy setting

        //Only update password if user typed a new one
        if (newPassword) {
            //Verify old password
            if (!currentPassword) {
                return res.render('edit-profile', {user, error: 'Please enter your current password to set a new one'});
            }
            const oldMatch = await bcrypt.compare(currentPassword, user.password);
            if (!oldMatch) {
                return res.render('edit-profile', {user, error: 'Current password is incorrect'});
            }

            if (newPassword !== confirmNewPassword) {
                return res.render('edit-profile', {user: user, error: 'New passwords do not match'});
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        // Update session info
        req.session.user.username = user.username;
        req.session.user.email = user.email;
        console.log("Profile updated:", user.username);

        res.render('edit-profile', {user: user, error: 'Profile updated successfully'});
        
    } catch(err) {
        console.error(err);
        res.redirect('/user-profile');
    }
}

//--DELETE PROFILE--//
exports.deleteProfile = async(req, res) => {
    try {
        const username = req.session.user.username;

        await User.findByIdAndDelete(req.session.user.id);
        req.session.destroy(() => {
            console.log("User deleted:", username);
            res.redirect('/register');
        })
    } catch(err) {
        console.error(err);
        res.redirect('/user-profile');
    }
}

//--LOGOUT--//
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}
