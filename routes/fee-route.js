const express = require('express');
const feeController = require('../controllers/fee-controller');

const router = express.Router();

//add structure
router.post('/user/add/structure', feeController.addStructure);

//fetch structures
router.get('/user/fetch/structure', feeController.fetchStructures);

//remove structure
router.post('/user/delete/structure', feeController.deleteStructure);

//update structure
router.post('/user/update/structure/:id', feeController.updateStructure);

//fetch fee statements
router.get('/student/fetch/fee/statements/:student', feeController.fetchFeeStatements);

//fetch accomodation statements
router.get('/student/fetch/accomodation/statements/:student', feeController.fetchAccomodationStatements);

module.exports = router;