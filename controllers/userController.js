const User = require('../models/user');

//--REGISTER--//
exports.registerGet = (req, res) => {
    res.render('register');
}

exports.registerPost = async(req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            role: req.body.role
        });
        await user.save();
        res.redirect('/login');            
    } catch(err) {
        console.error(err);
        res.redirect('/register');
    }
}

//--LOGIN--//
exports.loginGet = (req, res) => {
    res.render('login');
}

exports.loginPost = async(req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        if (!user) {
            console.log("User not found");
            return res.redirect('/login');
        }

        const match = req.body.password == user.password;
        if (!match) {
            console.log("Password mismatch");
            return res.redirect('/login');
        }
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }

        if(user.role === "admin") {
            return res.redirect('/admin-profile');
        }
        res.redirect('/user-profile');
    } catch(err) {
        console.error(err);
        res.redirect('/login');
    }
}

//--READ PROFILE--//
exports.profile = (req, res) => {
    res.render('user-profile', {user: req.session.user});
}

exports.adminProfile = (req, res) => {
    res.render('admin-profile', {user: req.session.user})
}

//--UPDATE PROFILE--//

