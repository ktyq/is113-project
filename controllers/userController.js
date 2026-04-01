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
        if(user.role === "admin" || user.role === 'superadmin') {
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
        res.render('edit-profile', {
            user: user, 
            error: null, 
            success: null, 
            passwordError: null, 
            passwordVerified: null
        });
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

        //Function rerender
        const rerender = (error, success, passwordError, passwordVerified = false) => {
            return res.render('edit-profile', {user, error, success, passwordError, passwordVerified });
        };

        let changesMade = false; // Track if any changes were made

        //--Username validation---------------------------------------------------------------------------------------------------------------
        if (username && username.trim() !== '') {
            if (username === user.username) {        
            return rerender('New username cannot be the same as the current one.', null, null);
            }
            //Check new username not taken by others
             const taken = await User.findOne({username: username});                 
            if(taken) {
                return rerender('Username is already in use', null, null);
            }
            user.username = username.trim();
            changesMade = true;
        }
        
        //--Email validation----------------------------------------------------------------------------------------------------------------
        if (email && email.trim() !== '') {
            if (email === user.email) {
                return rerender('New email cannot be the same as the current one.', null, null);
            }
            //Check new email not taken by others
            if (email !== user.email) {
                const taken = await User.findOne({email: email});
                if(taken) {
                    return rerender('Email is already in use', null, null);
                }
            }
            user.email = email.trim();
            changesMade = true;
        }         
        

        user.username = username || user.username;
        user.email = email || user.email;
        user.watchlistPrivacy = watchlistPrivacy || user.watchlistPrivacy; // Update privacy setting

        //--Password validation----------------------------------------------------------------------------------------------------------------
        if (currentPassword) {
            const oldMatch = await bcrypt.compare(currentPassword, user.password);
            if (!oldMatch) {
                //Save username/email changes made before returning error
                if (changesMade) await user.save();
                return rerender(null, null, 'Current password is incorrect', false);
            }

            //Current password verified - now check new password
            if (!newPassword || newPassword.trim() === '') { 
                //Password verified but no new password typed yet - show new fields
                if (changesMade) await user.save();
                return rerender(null, changesMade ? 'Profile updated successfully' : null, null, true);    
            }

            //Block setting same password
            const newMatch = await bcrypt.compare(newPassword, user.password);
            if (newMatch) {
                return rerender(null, null, 'New password cannot be the same as the current one.', true);
            }

            if (newPassword !== confirmNewPassword) {
                return rerender(null, null, 'New passwords do not match', true);
            }

            user.password = await bcrypt.hash(newPassword, 10);
            changesMade = true;
        }

        //--If nothing was changed----------------------------------------------------------------------------------------------------------------
        if (!changesMade) {
            return rerender('No changes were made. Please fill in at least one field to update.', null, null);
        }

        await user.save();
        
        // Update session info
        req.session.user.username = user.username;
        req.session.user.email = user.email;
        console.log("Profile updated:", user.username);

        return rerender(null, 'Profile updated successfully', null, false);

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

// =============================================================
// Admin: Manage Account
// =============================================================

// GET admin & user profiles
exports.manageAccountsGet = async (req, res) => {
    try {
        const users = await User.find({role: 'user'}).sort({createdAt: -1});
        const admins = await User.find({role: 'admin'}).sort({createdAt: -1});
        res.render('manage-accounts', {user: req.session.user, users, admins, error: null, success: null});
    } catch(err) {
        console.error(err);
        res.redirect('/admin-profile'); 
    }
}

// UPDATE user role (admin <-> user)
exports.promoteToAdmin = async(req, res) => {
    try {
        const {userId} = req.body;
        await User.findByIdAndUpdate(userId, {role: 'admin'});
        console.log("User promoted to Admin:", userId);
        res.redirect('/manage-accounts');
    } catch(err) {
        console.error(err);
        res.redirect('/manage-accounts');
    }
}

exports.demoteToUser = async(req, res) => {
    try {
        const {userId} = req.body;
        await User.findByIdAndUpdate(userId, {role:'user'});
        console.log("Admin demoted to User:", userId);
        res.redirect('/manage-accounts'); 
    } catch(err) {
        console.error(err);
        res.redirect('/manage-accounts');
    }
}