const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('student-dashboard', { title: 'Dashboard' });
});

router.get('/attendance', (req, res) => {
    res.render('attendance', { title: 'Attendance' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Mark Register' });
});

router.get('/fee', (req, res) => {
    res.render('fee', { title: 'School Fee' });
});

router.get('/accomodation', (req, res) => {
    res.render('accomodation', { title: 'Accomodation' });
});

router.get('/reg-units', (req, res) => {
    res.render('reg-units', { title: 'Register Units' });
});


module.exports = router