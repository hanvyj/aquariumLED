var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.json({users: [{name: 'Timmy23'}]});
});

module.exports = router;
