const express = require('express');
const studentController = require('../controllers/student-controller')

const router = express.Router();

//fetch students
router.get('/students/fetch', studentController.fetchStudents)

//remove student
router.post('/delete/student', studentController.deleteStudent)

//update student
router.post('/update/student/:id', studentController.updateStudent)

module.exports = router