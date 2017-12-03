const mongoose = require('mongoose')
const Resource = mongoose.model("Resource");
const multer = require('multer');
const uuid = require('uuid');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const fs = require('fs');
const fileName = `${uuid.v4()}.pdf`;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });

  const storage = cloudinaryStorage({
      cloudinary: cloudinary,
      fileFilter(req, file, next) {
        const isPdf = file.mimetype.startsWith('application/pdf');
        if(isPdf) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed!'}, false);
        }
      },
      filename(req, res, next) {
        next(null, fileName);
        req.body.resource = `${fileName}`;      
      }
  });

exports.upload = multer({ storage: storage }).single('resource');

exports.resourceHomepage = async (req, res) => {
    const course = req.params.course;
    const coursePromise = Resource.getCourses();
    const ResourcePromise = Resource.find({course: course});
    const [courses, resources] = await Promise.all([coursePromise, ResourcePromise]);
    res.render('resources', {course, title: 'Resources', courses, resources});
}

exports.courseResource = async (req, res) => {
    const course = req.params.course;
    const coursePromise = Resource.getCourses();
    const ResourcePromise = Resource.find({course: course});
    const [courses, resources] = await Promise.all([coursePromise, ResourcePromise]);
    res.render('resource', {course, title: ` ${course} Resources`, courses, resources});
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
    const pdf = `http://res.cloudinary.com/student-to-herokuapp-com/image/upload/v1/${resource.resource}`;
    fs.readFileSync(pdf,'utf8', (err, data) => {
        res.contentType('application/pdf'),
        res.send(data);
    });
};

exports.downloadResource = async (req, res) => {
    const resource = await Resource.findOne({slug: req.params.slug})
    const pdf = `http://res.cloudinary.com/student-to-herokuapp-com/image/upload/v1/${resource.resource}`;
    res.download(pdf, `${resource.title}.pdf`);
};