const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const slug = require('slugs');


const ResourceSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: "Please supply a title!"
    },
    slug: String,
    course: {
        type: String,
        required: 'Please choose a course'
    },
    level: String,
    resource: {
        type: String,
        required: 'Please Upload a resource!'
    }
});

ResourceSchema.pre('save',  async function(next) {
    if (!this.isModified('title')) {
        next();
        return;
    }
    this.slug = slug(this.title);
    // find other resources that have the same slug
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const resourceWithSlug = await this.constructor.find({ slug: slugRegEx});
    if(resourceWithSlug.length) {
        this.slug = `${this.slug}-${resourceWithSlug.length + 1}`;
    }
    next();
});

ResourceSchema.statics.getCourses = function() {
    return this.aggregate([
       { $unwind: '$course'},
       { $group: { _id: '$course', count: {$sum: 1 } }},
       {$sort: { count: -1}}
    ])
}

module.exports = mongoose.model('Resource', ResourceSchema );