const passport = require('passport');
const crypto =require('crypto');
const mongoose = require('mongoose');
const Staff = mongoose.model('Staff');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed to Login!',
    successRedirect: '/',
    successFlash: 'Logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    //check if they are logged in
    if (req.isAuthenticated()) {
        next();// they are logged in
        return;
    }
    req.flash('error', 'You must be logged in to do that!');
    res.redirect('/login');
};

exports.forgot = async (req, res) => {
    //1. check if a user with that email exists
    const staff = await Staff.findOne({email: req.body.email});
    if(!staff) {
        req.flash('error', "No account with that email exists!");
        return res.redirect('/login')
    }
    //2. set reset tokens and expiry on their account
    staff.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    staff.resetPasswordExpires = Date.now() + 900000 // 15 minutes from now
    await staff.save();
    //3. Send them an email withthe token
    const resetURL = `http://${req.headers.host}/forgot-password/${staff.resetPasswordToken}`;
    mail.send({
        staff,
        filename: 'password-reset',
        subject: 'Password Reset',
        resetURL
    });
    req.flash('success', `Password reset link sent!.`);
    //4. redirect to the login page
    res.redirect('/login');
};

exports.reset = async (req, res) => {
    const staff = await Staff.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if (!staff) {
        req.flash('error','Password token is invalid or has expired');
        return res.redirect('/login');
    }
    //if there is a user,show the reset form
    res.render('reset', {title: 'Reset your password!'});
}

exports.confirmedPasswords = (req, res, next) => {
    if(req.body.password === req.body['confirm-password']) {
        next();
        return;
    }
    req.flash('error', 'Passwords do not match!');
    res.redirect('back');
}

exports.update = async (req, res) => {
    const staff = await Staff.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if (!staff) {
        req.flash('error','Password token is invalid or has expired');
        return res.redirect('/login');
    }

    const setPassword = promisify(staff.setPassword, staff);
    await setPassword(req.body.password);
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpires = undefined;
    const updatedStaff = await staff.save();
    await req.login(updatedStaff);
    req.flash('success', 'Password reset successful!');
    res.redirect('/');
};