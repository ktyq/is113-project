exports.isLoggedIn = async (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in");
        return res.redirect('/login');
    }

    try {
        // Check if session user still exists in database
        const user = await require('../models/User').findById(req.session.user.id);
        if (!user) {
            console.log("User no longer exists, not found in database");
            return req.session.destroy(() => res.redirect('/login'));
        }

        // Refresh session user data with latest from database
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            watchlistPrivacy: user.watchlistPrivacy
        };

    } catch (error) {
        console.error("isLoggedIn middleware error", error);
        return res.redirect('/login');
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in");
        return res.redirect('/login');
    }
    if (req.session.user.role !== 'admin' && req.session.user.role !== 'superadmin') {
        console.log("Access denied: User is not admin");
        return res.redirect('/index');
    }
    next();
}
