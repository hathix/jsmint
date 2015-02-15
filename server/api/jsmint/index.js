'use strict';

var express = require('express');
var controller = require('./jsmint.controller');

var router = express.Router();

router.post('/test', controller.test);
router.post('/acorn', controller.acorn);

module.exports = router;
