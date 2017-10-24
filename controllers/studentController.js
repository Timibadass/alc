const mongoose = require('mongoose');
const Student = mongoose.model('Student');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed!'}, false);
        }
    }
}

exports.homePage = (req, res) => {
    res.render('index', { title: 'Welcome to Andela Learning College'})
};


exports.addStudent = (req, res) => {
    res.render('editStudent', { title: 'Add Student'});
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    //check if there is no new file to resize
    if(!req.file) {
        next(); //skip to the next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`public/uploads/student/${req.body.photo}`);
    next();
}

exports.createStudent = async (req, res) => {
    req.body.author = req.user._id;
    const student = await (new Student(req.body)).save();
    req.flash('success', `Successfully Added ${student.name}`)
    res.redirect(`/students/${student.slug}`);
};


exports.getStudents = async (req, res) => {
    const students = await Student.find();
    res.render('students', {title: 'Students', students});
};

const confirmAccess = (student, user) => {
    if(!student.author.equals(user._id)) {
        throw Error('You can\'t edit or Delete this student\'s details');
    }
}

exports.editStudent = async (req, res) => {
    // 1. Find the Student given the ID
    const student = await  Student.findOne({_id: req.params.id});
    // 2. Confirm they have access to edit 
    confirmAccess(student, req.user);
    // 3. Render out the edit form so user can update
    res.render('editStudent', {title: `Edit ${student.name}`, student})
}

exports.updateStudent = async (req, res) => {
    // find and update te student data
    const student = await Student.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true, //return the updated student data
        runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <strong>${student.name}</strong>. <a href='/students/${student.slug}'>View ${student.name} Info</a>`);
    res.redirect(`/students/${student._id}/edit`);
};

exports.viewStudent = async (req, res, next) => {
    const student = await Student.findOne({slug: req.params.slug}).populate('author');
    if(!student) return next();
    res.render('student', {student, title: student.name});
};

exports.getStudentsByLevel = async (req, res) => {
    const levels = req.params.level;
    const levelsPromise = Student.getLevels();
    const studentPromise = Student.find({level: levels});
    const [level, students] = await Promise.all([levelsPromise, studentPromise]);
    res.render('levels', {level, title: 'Levels', levels, students});
}

exports.displaySudentsInLevel = async (req, res) => {
    const levels = req.params.level;
    const levelsPromise = Student.getLevels();
    const studentPromise = Student.find({level: levels});
    const [level, students] = await Promise.all([levelsPromise, studentPromise]);
    res.render('level', {level, title: `${levels} Levels`, levels, students});
}

exports.getStudentsByDepartment = async (req, res) => {
    const departments = req.params.department;
    const departmentPromise = Student.getDepartments();
    const studentPromise = Student.find({department: departments});
    const [department, students] = await Promise.all([departmentPromise, studentPromise]);
    res.render('departments', {department, title: 'Departments', departments, students});
}

exports.displaySudentsInDepartment = async (req, res) => {
    const department = req.params.department;
    const departmentPromise = Student.getDepartments();
    const studentPromise = Student.find({department: department});
    const [departments, students] = await Promise.all([departmentPromise, studentPromise]);
    res.render('department', {department, title: ` ${department} Department`, departments, students});
}

exports.deleteStudent = async (req, res, next) => {
    const student = await Student.findOne({slug: req.params.slug});
    confirmAccess(student, req.user);
    await student.remove();
    req.flash('success', `${student.name} successfully deleted!`);
    res.redirect('/students')
}