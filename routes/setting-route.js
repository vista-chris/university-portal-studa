const express = require('express');
const settingsController = require('../controllers/setting-controller')

const router = express.Router();

//fetch periods
router.get('/user/fetch/period', settingsController.fetchPeriods)

//add period
router.post('/user/add/period', settingsController.addPeriod)

module.exports = router