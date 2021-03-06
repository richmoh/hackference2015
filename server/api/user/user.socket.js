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

  	//console.log('Just did a geo location update.. ', data);
  	
  	var userId = data.userId;

  	var lg = data.lg;
  	var lt = data.lt;

    var coords = [lg, lt];

    

    var maxDistance = 1;

  	User.findById(data.userId, function (err, user) {

  		user.loc = coords;

      console.log(user.name, lg, lt);
  		
      user.save(function(err) {

  			if (err) console.log(err);

        User.find({
          loc: {
            $near: {
               $geometry: {
                  type: "Point" ,
                  coordinates: coords
               },
               $maxDistance: 20
            }
          },
          _id: {
            $ne: user._id
          }

        }).exec(function(err, users){

          socket.emit('userGeoUpdate', {

            name: user.name,
            coords: coords,
            users: users

          });

        });

        // Beacon.find({
        //   loc: {
        //     $near: coords,
        //     $maxDistance: maxDistance
        //   }
        // }).populate('_user', 'name email loc').exec(function(err, beacons){

        //   socket.emit('userGeoUpdate', beacons);

        // });
  			
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