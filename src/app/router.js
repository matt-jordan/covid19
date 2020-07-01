const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index');
});
router.get('/us', (req, res) => {
  res.render('pages/us');
});
router.get('/states', (req, res) => {
  res.render('pages/states');
});

module.exports = router;