exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in");
        return res.redirect('/login');
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in");
        return res.redirect('/login');
    }
    if (req.session.user.role !== 'admin') {
        console.log("User is not an admin");
        return res.redirect('/user-profile');
    }
    next();
}