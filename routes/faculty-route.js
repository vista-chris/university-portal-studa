const express = require('express');
const facultyController = require('../controllers/faculty-controller');

const router = express.Router();

//add faculty
router.post('/add/faculty', facultyController.addFaculty);

//fetch faculty
router.get('/fetch/faculty', facultyController.fetchFaculty);

module.exports = router;