const express = require('express');
const courseController = require('../controllers/course-controller')

const router = express.Router();

//add course
router.post('/add/course', courseController.addCourse)

//fetch courses
router.get('/fetch/courses', courseController.fetchCourses)

//remove course
router.post('/delete/course', courseController.deleteCourse)

//update course
router.post('/update/course/:id', courseController.updateCourse)

module.exports = router