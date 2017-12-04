const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const userController = require('../controllers/userController');
const resourceController = require('../controllers/ResourceController');
const authController = require('../controllers/authController');
const { catchErrors} = require('../handlers/errorHandlers');
// Do work here
router.get('/', studentController.homePage)

router.get('/students', catchErrors(studentController.getStudents));
router.get('/add', 
  authController.isLoggedIn,
  studentController.addStudent);
router.post('/add',
  studentController.upload,
  studentController.addPhotoToReq,
  catchErrors(studentController.createStudent)
);
router.post('/add/:id', 
  studentController.upload,
  studentController.addPhotoToReq,
  catchErrors(studentController.updateStudent)
);

router.get('/addResource',
 authController.isLoggedIn,
 resourceController.addResource);
router.post('/addResource', 
  resourceController.upload,
  catchErrors(resourceController.createResource)
);

router.get('/resources', catchErrors(resourceController.resourceHomepage));
router.get('/resources/:course', catchErrors(resourceController.courseResource));

router.get('/resources/view/:slug', catchErrors(resourceController.viewResource));

router.get('/resources/:slug/download',catchErrors(resourceController.downloadResource))

router.get('/students/:id/edit', catchErrors(studentController.editStudent));

router.get('/students/:slug', catchErrors(studentController.viewStudent));

router.get('/levels', catchErrors(studentController.getStudentsByLevel));
router.get('/levels/:level', catchErrors(studentController.displaySudentsInLevel));

router.get('/departments', catchErrors(studentController.getStudentsByDepartment));
router.get('/departments/:department', catchErrors(studentController.displaySudentsInDepartment));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

//1. we need to validate the registration data
//2. register the user
//3. we need to log them in
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.post('/forgot-password', catchErrors(authController.forgot));
router.get('/forgot-password/:token', catchErrors(authController.reset))
router.post('/forgot-password/:token', 
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

router.get('/students/:slug/delete', catchErrors(studentController.deleteStudent));

module.exports = router;