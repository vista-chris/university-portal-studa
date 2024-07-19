const express = require('express');
const courseController = require('../controllers/course-controller')

const router = express.Router();

//add course
router.post('/user/add/course', courseController.addCourse)

//fetch courses
router.get('/user/fetch/courses', courseController.fetchCourses)

//remove course
router.post('/user/delete/course', courseController.deleteCourse)

//update course
router.post('/user/update/course/:id', courseController.updateCourse)

module.exports = router