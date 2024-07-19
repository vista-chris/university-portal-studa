const express = require('express');
const semesterController = require('../controllers/semester-controller')

const router = express.Router();

//register semester
router.post('/reg/semester', semesterController.regSemester)

//fetch semester
router.get('/semester/fetch/:student', semesterController.fetchRegSemester)

module.exports = router