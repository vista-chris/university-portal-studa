const express = require('express');
const authController = require('../controllers/auth-controller');
const router = express.Router();

//signup
router.post('/signup', authController.signup)

//signin
router.post('/signin', authController.signin)

//student signin
router.post('/login', authController.login)

//logout
router.get('/logout', authController.logout)

//forgot user password
router.post('/forgot/user/password', authController.forgotUserPassword)

//reset user password
router.get('/reset/user/:id/:token', authController.resetUser)

//forgot student password
router.post('/forgot/student/password', authController.forgotStudentPassword)

//reset student password
router.get('/reset/student/:id/:token', authController.resetStudent)

//reset user password
router.post('/reset/user/:id/:token', authController.resetUserPassword)

//reset student password
router.post('/reset/student/:id/:token', authController.resetStudentPassword)

//update password
router.post('/update/password', authController.updatePassword)

//user signin page
router.get('/signin', (req, res) => {
    res.render('signin', { title: 'Signin' })
})

//student login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
})

//forgot user password page
router.get('/forgot-user-password', (req, res) => {
    res.render('forgot-user-password', { title: 'Forgot password' })
})

//forgot student password page
router.get('/forgot-student-password', (req, res) => {
    res.render('forgot-student-password', { title: 'Forgot password' })
})

//add student
router.post('/add/student', authController.addStudent)

//index
router.get('/', (req, res) => {
    res.redirect('student');
});

module.exports = router