'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = require('../user/user.model');

var BeaconSchema = new Schema({
  text: String,
  lg: String,
  lt: String,
  active: Boolean,
  _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Beacon', BeaconSchema);