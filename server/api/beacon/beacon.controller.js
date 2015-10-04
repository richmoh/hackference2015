'use strict';

var _ = require('lodash');
var Beacon = require('./beacon.model');

// Get list of beacons
exports.index = function(req, res) {
  
  Beacon.find({_user: req.user._id}, function (err, beacons) {

    if(err) { return handleError(res, err); }
    
    return res.status(200).json(beacons);

  });
};

// Get a single beacon
exports.show = function(req, res) {
  Beacon.findById(req.params.id, function (err, beacon) {
    if(err) { return handleError(res, err); }
    if(!beacon) { return res.status(404).send('Not Found'); }
    return res.json(beacon);
  });
};

// Creates a new beacon in the DB.
exports.create = function(req, res) {

  Beacon.create(req.body, function(err, beacon) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(beacon);
  });
};

// Updates an existing beacon in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Beacon.findById(req.params.id, function (err, beacon) {
    if (err) { return handleError(res, err); }
    if(!beacon) { return res.status(404).send('Not Found'); }
    var updated = _.merge(beacon, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(beacon);
    });
  });
};

// Deletes a beacon from the DB.
exports.destroy = function(req, res) {
  Beacon.findById(req.params.id, function (err, beacon) {
    if(err) { return handleError(res, err); }
    if(!beacon) { return res.status(404).send('Not Found'); }
    beacon.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}