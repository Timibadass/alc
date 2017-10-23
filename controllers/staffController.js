const mongoose = require('mongoose');
const Staff = mongoose.model('Staff');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', {title: 'Login'});
}

exports.registerForm = (req, res) => {
    res.render('register', {title: 'Register'})
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name').notEmpty();
    req.checkBody('email', 'That email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
    req.checkBody('confirm-password', 'Confirmed password cannot be blank!').notEmpty();
    req.checkBody('confirm-password', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if(errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash() });
        return;
    }
    next();
};

exports.register = async (req, res, next) => {
    const staff = new Staff({email: req.body.email, name: req.body.name});
    const register = promisify(Staff.register, Staff);
    await register(staff, req.body.password);
    next(); 
};