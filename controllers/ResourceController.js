const mongoose = require('mongoose')
const Resource = mongoose.model("Resource");
const multer = require('multer');
const uuid = require('uuid');
const fs = require('fs');

const multerOptions = {
    storage: multer.diskStorage({
        destination: (req, file, next) => {
            next(null, `public/uploads/`)
        },
       filename: (req, file, next) => {
           const resourceName = `${uuid.v4()}.pdf`;
           next(null, resourceName);
           req.body.resource = resourceName;
       }
    }),
    fileFilter(req, file, next) {
        const isPdf = file.mimetype.startsWith('application/pdf');
        if(isPdf) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed!'}, false);
        }
    }
};

exports.upload = multer(multerOptions).single('resource');

exports.resourceHomepage = async (req, res) => {
    const course = req.params.course;
    const coursePromise = Resource.getCourses();
    const ResourcePromise = Resource.find({course: course});
    const [courses, resources] = await Promise.all([coursePromise, ResourcePromise]);
    res.render('resources', {course, title: 'Resources', courses, resources});
}

exports.addResource = (req, res) => {
    res.render('addResource', {title: 'Add resource'})
};

exports.createResource = async (req, res) => {
    const resource = await (new Resource(req.body)).save();
    req.flash('success', `Successfully added ${resource.title}!`);
    res.redirect('resources/');
};

exports.viewResource = async (req, res) => {
    const resource = await Resource.findOne({slug: req.params.slug});
    const pdf = `${__dirname}/../public/uploads/${resource.resource}`;
    fs.readFile(pdf, (err, data) => {
        res.contentType('application/pdf'),
        res.send(data);
    });
};

exports.downloadResource = async (req, res) => {
    const resource = await Resource.findOne({slug: req.params.slug})
    const pdf = `${__dirname}/../public/uploads/${resource.resource}`;
    res.download(pdf, `${resource.title}.pdf`);
};