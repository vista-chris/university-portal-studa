const express = require('express');
const attendanceConroller = require('../controllers/attendance-controller')

const router = express.Router();

//attendance qr code
router.post('/attendance/qrcode', attendanceConroller.attendanceQRCode)

//attendance scanner
router.post('/attendance/qrscanner', attendanceConroller.attendanceQRScanner)

//fetch attendance records
router.get('/attendance/records', attendanceConroller.attendanceRecords)

//remove attendance
router.post('/delete/attendance', attendanceConroller.deleteAttendance)

//fetch attendance details
router.get('/attendance/details', attendanceConroller.attendanceDetails)

//fetch unit attendance details
router.post('/unit/attendance/:id', attendanceConroller.unitAttendance)

module.exports = router