const passport = require('passport');
const mongoose = require('mongoose');
const Staff = mongoose.model('Staff');

passport.use(Staff.createStrategy());

passport.serializeUser(Staff.serializeUser());
passport.deserializeUser(Staff.deserializeUser());
