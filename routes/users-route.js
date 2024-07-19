const express = require('express');
const userController = require('../controllers/user-controller')

const router = express.Router();

//fetch users
router.get('/fetch/users', userController.fetchUsers)

//remove user
router.post('/delete/user/:id', userController.deleteUser)

//remove user
router.post('/update/user/:id', userController.updateUser)

module.exports = router