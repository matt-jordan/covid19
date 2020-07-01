const express = require('express');
const router = express.Router();

const home = require('./controllers/home');
const us = require('./controllers/us');
const states = require('./controllers/states');

router.get('/', home);
router.get('/us', us);
router.get('/states', states);

module.exports = router;