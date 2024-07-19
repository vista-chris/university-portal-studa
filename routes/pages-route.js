const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('user-dashboard', { title: 'Dashboard' });
});

router.get('/students', (req, res) => {
    res.render('students', { title: 'Students' });
});

router.get('/attendance', (req, res) => {
    res.render('attendance', { title: 'Attendance' });
});

router.get('/timetable', (req, res) => {
    res.render('timetable', { title: 'Timetable' });
});

router.get('/hostels', (req, res) => {
    res.render('dorms', { title: 'Hostels' });
});

router.get('/users', (req, res) => {
    res.render('users', { title: 'Users' });
});

router.get('/faculty', (req, res) => {
    res.render('faculty', { title: 'Faculty & Halls' });
});

router.get('/courses', (req, res) => {
    res.render('courses', { title: 'Courses' });
});

router.get('/units', (req, res) => {
    res.render('units', { title: 'Units' });
});

router.get('/fee-structure', (req, res) => {
    res.render('fee-structure', { title: 'Fees' });
});

router.get('/user-profile', (req, res) => {
    res.render('user-profile', { title: 'Profile' });
});

router.get('/lec-units', (req, res) => {
    res.render('lec-units', { title: 'Units' });
});

router.get('/settings', (req, res) => {
    res.render('settings', { title: 'Settings' });
});


module.exports = router