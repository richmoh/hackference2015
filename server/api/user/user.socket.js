/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var User = require('./user.model');
var Beacon = require('../beacon/beacon.model');

exports.register = function(socket) {

  User.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  User.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });

  socket.on('geoupdate', function(data){

  	console.log('Just did a geo location update.. ', data);
  	
  	var userId = data.userId;

  	var lg = String(data.lg);
  	var lt = String(data.lt);

  	User.findById(data.userId, function (err, user) {

  		user.lg = lg;
  		user.lt = lt;

  		user.save(function(err) {

  			if (err) console.log(err);

        Beacon.find().populate('_user', 'name email lg lt').exec(function(err, beacons){

          socket.emit('userGeoUpdate', beacons);

        });
  			
  		});

  	});


  });
}

function onSave(socket, doc, cb) {
  socket.emit('user:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('user:remove', doc);
}