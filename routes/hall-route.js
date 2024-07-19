const express = require('express');
const hallController = require('../controllers/hall-controller');

const router = express.Router();

//add hall
router.post('/add/hall', hallController.addHall);

//update hall
router.post('/update/hall', hallController.updateHall);

//delete hall
router.post('/delete/hall', hallController.deleteHall);

//fetch hall
router.get('/fetch/hall', hallController.fetchHall);

module.exports = router;