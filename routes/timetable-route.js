const express = require('express')
const timetableController = require('../controllers/timetable-controller')

const router = express.Router()

//generate timetable
router.post('/generate/timetable', timetableController.generateTimetable)

//delete timetable
router.post('/delete/timetable', timetableController.deleteTimetable)

//fetch timetable
router.get('/fetch/timetable', timetableController.fetchTimetable)

module.exports = router