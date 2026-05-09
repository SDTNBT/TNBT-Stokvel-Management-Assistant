const express = require('express');
const router = express.Router();
const { saveMinutes } = require('../controllers/minutesController');

// The route is just '/:groupId' because server.js will handle the '/api/minutes' part
router.post('/:groupId', saveMinutes);

module.exports = router;