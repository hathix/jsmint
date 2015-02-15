'use strict';

var _ = require('lodash'),
    acorn = require('acorn');

// Send back what you sent
exports.test = function(req, res) {
    res.json({
        body: req.body
    });
};

// Uses Acorn to parse the given *body* and returns its output.
exports.acorn = function(req, res) {
    var result = acorn.parse(req.body.text);
    res.json({
        result: result
    });
};
