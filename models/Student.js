const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Please supply student name!",
    },
    slug: String,
    level: {
        type: String,
        trim: true,
        required: "You must supply level"
    },
    department: {
        type: String,
        trim: true,
        required: "You must supply department"
    },
    number: Number,
    email: {
        type: String,
        required: 'You must supply Email address'
    },
    age: {
        type: Number,
        required: "You must supply age",
    },
    gender: String,
    courses: [String],
    admitted: {
        type: Date,
        default: Date.now,
    },  
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Staff',
        required: 'You must supply an author'
    }
});

studentSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next();
        return;
    }
    this.slug = slug(this.name);
    // find other students that have the same slug
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const studentsWithSlug = await this.constructor.find({ slug: slugRegEx});
    if(studentsWithSlug.length) {
        this.slug = `${this.slug}-${studentsWithSlug.length + 1}`;
    }
    next();
});

studentSchema.statics.getLevels = function() {
    return this.aggregate([
       { $unwind: '$level'},
       { $group: { _id: '$level', count: {$sum: 1 } }},
       {$sort: { count: -1}}
    ])
}

studentSchema.statics.getDepartments = function() {
    return this.aggregate([
       { $unwind: '$department'},
       { $group: { _id: '$department', count: {$sum: 1 } }},
       {$sort: { count: -1}}
    ])
}

module.exports = mongoose.model('Student', studentSchema );