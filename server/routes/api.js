var express = require('express');
var router = express.Router();
const lightingController = require('../bin/lightingController');

/* GET users listing. */
router.post('/refresh', function(req, res) {
  console.log('refreshing');
  lightingController.restart();
});

module.exports = router;
