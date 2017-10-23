const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const staffSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please supply an email Address'
    },
    name: {
        type: String,
        required: "Please Supply a name",
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

staffSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
staffSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Staff', staffSchema);