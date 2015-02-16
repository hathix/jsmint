'use strict';

var express = require('express');
var controller = require('./jsmint.controller');

var router = express.Router();
/*
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
*/

router.post('/whitelist', controller.whitelist);
router.post('/acorn', controller.acorn);

module.exports = router;
