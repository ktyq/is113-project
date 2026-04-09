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

exports.isAdmin = async (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in");
        return res.redirect('/login');
    }
    try {
        //Re-check role from DB in case it was changed since login
        const user = await require('../models/User').findById(req.session.user.id);
        if (!user) {
            console.log("User no longer exists, not found in database");
            return req.session.destroy(() => res.redirect('/login'));
        }

        //Refresh role in session
        req.session.user.role = user.role;

        if (user.role !== 'admin' && user.role !== 'superadmin') {
        console.log("Access denied: User is not admin");
        return res.redirect('/profile');
    }

    next();
    } catch (error) {
        console.error("isAdmin middleware error", error);
        return res.redirect('/login');
    }
    
}
