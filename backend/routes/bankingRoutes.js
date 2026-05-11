const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/authMiddleware');
const { getSABanks, saveBankingDetails , getBankingDetails} = require('../controllers/bankingController');


router.post('/save', verifyFirebaseToken, saveBankingDetails);
router.get('/list', verifyFirebaseToken, getSABanks);
router.get('/my-details', verifyFirebaseToken, getBankingDetails);

module.exports = router;