const User = require('../models/User');
const bcrypt = require('bcrypt');

//--Validation and Error Handling ----------------------------------------- //
function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function validatePassword(password) {
    const errors = [];
    if (password.length < 6) errors.push('Password must be at least 6 characters long');
    return errors;
};

function validateUsername(username) {
    const errors = [];
    if (username.length < 3) errors.push('Username must be at least 3 characters long');
    if (username.length > 20) errors.push('Username cannot exceed 20 characters');
    if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.push('Username can only contain letters, numbers, and underscores');
    return errors;
}

//--REGISTER----------------------------------------------------------------- //

exports.registerGet = (req, res) => {
    res.render('register', { errors: [], success: null });
};

exports.registerPost = async (req, res) => {
    const { username, email, password, confirmPassword, role } = req.body;
    const errors = [];
    
    if (!username || !email || !password || !confirmPassword) {
        errors.push('All fields are required');
    } else {
        validateUsername(username).forEach(err => errors.push(err));
        if (!validateEmail(email)) errors.push('Please enter a valid email address');
        validatePassword(password).forEach(err => errors.push(err));
        if (password !== confirmPassword) errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        return res.render('register', { errors, success: null });
    }

    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (existingUser) {
            return res.render('register', { errors: ['Username or email already exists'], success: null });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: username,
            email: email,
            password: hashedPassword,
            role: 'user',
            watchlistPrivacy: 'friends'
        });

        await user.save();
        console.log("User registered:", user.username, user.role);
        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.render('register', { errors: ['An error has occurred. Please try again.'], success: null });
    }
};

//--LOGIN----------------------------------------------------------------- //
exports.loginGet = (req, res) => {
    res.render('login', { errors: [], success: null, accNotFound: false, wrongPass: false, identifier: '' });
};

exports.loginPost = async (req, res) => {
    const { identifier, password } = req.body;
    
    // Helper function rerender
    const rerender = (extras) => res.render('login', {
        errors: null,
        success: null,
        accNotFound: false,
        wrongPass: false,
        identifier : identifier || '', //pre-fill identifier field
        ...extras
    })

    // Log validation issues only to console    
    if (!identifier || !password) {
        console.log('Login attempt failed: Missing fields');
        return rerender({ errors: ['Please fill in all fields'] });
    }
    if (password.length < 6) console.log('Login attempt failed: Password must be at least 6 characters long');
    
    try {
        const isEmail = validateEmail(identifier);
        const query = isEmail ? { email: identifier } : { username: identifier };
        const user = await User.findOne(query);

        if (!user) {
            console.log('Login attempt failed: Account not found for identifier:', identifier);
            return rerender({ accNotFound: true});
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('Login attempt failed: Incorrect password for', identifier);
            return rerender({ wrongPass: true });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            watchlistPrivacy: user.watchlistPrivacy   
        };
        console.log("User logged in:", user.username, user.role);

        if (user.role === "admin" || user.role === 'superadmin') {
            return res.redirect('/profile');
        }
        res.redirect('/index');

    } catch (err) {
        console.error(err.message);
        return rerender ({ errors: ['An error occurred. Please try again.'] });
    }
};

//--READ PROFILE----------------------------------------------------------------- // 
exports.profile = (req, res) => {
    res.render('profile', { user: req.session.user });
};

//--UPDATE PROFILE----------------------------------------------------------------- //
exports.editProfileGet = async (req, res) => {
    const { user } = req.session;

    try {
        const userId = await User.findById(user.id);
        res.render('edit-profile', {
            user: userId,
            errors: [],
            success: null,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
};

exports.editProfilePost = async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword, confirmNewPassword, watchlistPrivacy } = req.body;
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect('/login');
        
        const errors = [];
        let changesMade = false; // Track if any changes were made

        // Validate username
        if (username && username.trim() !== '') {
            if (username === user.username) {
                errors.push('New username cannot be the same as the current one.');
            } else {
                validateUsername(username).forEach(e => errors.push(e));
                if (errors.length === 0) {
                    const taken = await User.findOne({ username: username });
                    if (taken) {
                        errors.push('Username is already in use');
                    } else {
                        user.username = username.trim();
                        changesMade = true;
                    }
                }
            }
        }          

        // Validate email
        if (email && email.trim() !== '') {
            if (email === user.email) {
                errors.push('New email cannot be the same as the current one.');
            } else if (!validateEmail(email)) {
                errors.push('Please enter a valid email address');
            } else {
                const taken = await User.findOne({email});
                if (taken) {errors.push('Email is already in use');}
                else {
                    user.email = email.trim();
                    changesMade = true;
                }
            }
        }

        // Watchlist privacy setting
        if (watchlistPrivacy && watchlistPrivacy !== user.watchlistPrivacy) {
            user.watchlistPrivacy = watchlistPrivacy;
            changesMade = true;
        }

        // Validate Password
        if (currentPassword || newPassword || confirmNewPassword) {
            if (!currentPassword) {
                errors.push('Please enter your current password to set a new one');
            } else {
                const oldMatch = await bcrypt.compare(currentPassword, user.password);
                if (!oldMatch) {
                    errors.push('Current password is incorrect');
                } else if (!newPassword) {
                    errors.push('Please enter a new password');
                } else {
                    validatePassword(newPassword).forEach(e => errors.push(e));
                    if (newPassword !== confirmNewPassword) {
                        errors.push('New passwords do not match');
                    }
                    const newMatch = await bcrypt.compare(newPassword, user.password);
                    if (newMatch) {
                        errors.push('New password cannot be the same as the current one.');
                    }
                
                    if (errors.length === 0) {
                        user.password = await bcrypt.hash(newPassword, 10);
                        changesMade = true;
                    }
                }
            }   
        }

        if (errors.length > 0) {
            return res.render('edit-profile', { user, errors, success: null });
        }

        //--If nothing was changed----------------------------------------------------------------------------------------------------------------
        if (!changesMade) {
            return res.render('edit-profile', { user, errors: ['No changes were made. Please fill in at least one field to update.'], success: null });
        }

        await user.save();

        // Update session info
        req.session.user.username = user.username;
        req.session.user.email = user.email;
        console.log("Profile updated:", user.username);

        return res.render('edit-profile', { user, errors: null, success: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
};

//--DELETE PROFILE----------------------------------------------------------------- //
exports.deleteProfile = async (req, res) => {    
    try {
        const userId = req.session.user.id;
        const username = req.session.user.username;
        await User.findByIdAndDelete(userId);
        req.session.destroy(() => {
            console.log("User deleted:", username);
            res.redirect('/register');
        });
    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
};

//--LOGOUT----------------------------------------------------------------- //
exports.logout = (req, res) => {
    const username = req.session.user ? req.session.user.username : 'Unknown';
    const role = req.session.user ? req.session.user.role : 'Unknown';
    req.session.destroy(() => {
        console.log("User logged out:", username, role);
        res.redirect('/login');
    });
};

// =============================================================
// Admin: Manage Account
// =============================================================

// GET admin & user profiles
exports.manageAccountsGet = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
        res.render('manage-accounts', { user: req.session.user, users, admins, errors: [], success: null });
    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
};

// UPDATE user role (admin <-> user)
exports.promoteToAdmin = async (req, res) => {
    try {
        const { userId } = req.body;

        // Prevent self-promotion to admin
        if (userId === req.session.user.id) {
            return res.redirect('/manage-accounts');
        }

        await User.findByIdAndUpdate(userId, { role: 'admin' });
        console.log("User promoted to Admin:", userId);
        res.redirect('/manage-accounts');
    } catch (err) {
        console.error(err);
        res.redirect('/manage-accounts');
    }
};

exports.demoteToUser = async (req, res) => {
    try {
        const { userId } = req.body;

        // Prevent self-demotion
        if (userId === req.session.user.id) {
            return res.redirect('/manage-accounts');
        }

        await User.findByIdAndUpdate(userId, { role: 'user' });
        console.log("Admin demoted to User:", userId);
        res.redirect('/manage-accounts');
    } catch (err) {
        console.error(err);
        res.redirect('/manage-accounts');
    }
};