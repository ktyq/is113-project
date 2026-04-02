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
    if (req.session.user.role !== 'admin' && req.session.user.role !== 'superadmin') {
        console.log("Access denied: User is not admin");
        return res.redirect('/index');
    }
    next();
}
