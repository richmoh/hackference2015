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

  	console.log('Addng a ', data);
  	
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


  socket.on('planting mine', function(data){

    console.log('Addng a mine', data);
    

    var lg = data.lg;
    var lt = data.lt;

    var coords = [lg, lt];

    var maxDistance = 1;

    Beacon.create(data, function(err, beacon) {
      
      if(err) { return handleError(res, err); }

      Beacon.find().exec(function(err, mines){

        socket.broadcast.emit('update mines', mines);
        socket.emit('update mines', mines);

        // return res.status(201).json(beacon);

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