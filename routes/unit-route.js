const express = require('express');
const unitController = require('../controllers/unit-controller')

const router = express.Router();

//add unit
router.post('/user/add/unit', unitController.addUnit)

//fetch units
router.get('/fetch/units', unitController.fetchUnits)

//remove unit
router.post('/user/delete/unit', unitController.deleteUnit)

//update unit
router.post('/user/update/unit/:id', unitController.updateUnit)

//apply selected units
router.post('/user/apply/unit', unitController.applyUnits)

//fetch offered units
router.get('/fetch/offered/units', unitController.fetchOfferedUnits)

//delete selected units
router.post('/remove/offered/units', unitController.removeOfferedUnit)

//register units
router.post('/student/reg/units', unitController.regUnits)

//fetch registered units
router.post('/student/fetch/reg/units/:student', unitController.fetchRegUnits)

//delete registered units
router.post('/student/remove/reg/unit', unitController.removeRegUnit)

module.exports = router