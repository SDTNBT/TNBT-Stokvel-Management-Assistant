const express = require('express');
const router = express.Router();
<<<<<<< Updated upstream
const verifyFirebaseToken = require('../middleware/authMiddleware');
=======
const  verifyFirebaseToken  = require('../middleware/authMiddleware');
>>>>>>> Stashed changes
const { getSABanks, saveBankingDetails , getBankingDetails} = require('../controllers/bankingController');


router.post('/save', verifyFirebaseToken, saveBankingDetails);
router.get('/list', verifyFirebaseToken, getSABanks);
router.get('/my-details', verifyFirebaseToken, getBankingDetails);

module.exports = router;