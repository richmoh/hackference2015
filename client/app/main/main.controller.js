'use strict';

var emitGeoUpdate = null;

angular.module('hackference2015App')
  .controller('MainCtrl', function ($scope, $http, socket, $cookieStore, User) {
    $scope.awesomeThings = [];

    $scope.inputs = {

      lg: -1.88801,
      lt: 52.4770815,
      beaconText: '',
      searchText: ''

    };

    User.get().$promise.then(function(user){
        
      $scope.mybeacons = user.beacons;

    });


    console.log(User.get());

    socket.socket.on('userGeoUpdate', function(data){

      //I need to get the beacons

      console.log('User updated on server side to client', data);
    });

    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    //   socket.syncUpdates('thing', $scope.awesomeThings);
    // });

    // $http.get('/api/beacons').success(function(mybeacons) {
    //   $scope.mybeacons = mybeacons;
    //   socket.syncUpdates('beacon', $scope.mybeacons);
    // });

    $scope.addBeacon = function() {
      if($scope.inputs.beaconText === '') {
        return;
      }

      $http.post('/api/users/beacon', { 

        text: $scope.inputs.beaconText

      }).success(function(){

        $scope.mybeacons.push($scope.inputs.beaconText);
        $scope.inputs.beaconText = '';
        
      });

      
    };

    $scope.deleteBeacon = function(beacon) {
      $http.delete('/api/beacons/' + beacon._id);
    };

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.match = function()
    {
      $scope.geoUpdateS($scope.inputs);
    }

    $scope.geoUpdate = function(args)
    {
      $http.put('/api/users/geolocation', {
        lg: args.lg,
        lt: args.lt
      });
    }

    $scope.geoUpdateS = function(args)
    {
      //console.log(socket);

      if ($cookieStore.get('token')) {
        //config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');


        args.token = $cookieStore.get('token');
      }
      
      User.get().$promise.then(function(user){
        
        //console.log('test2',user._id);

        args.userId = user._id;

        socket.socket.emit('geoupdate', args, function(){
          console.log('did emit');
        });

      });

      
    }

    //Make a fake geo update - for testing
    emitGeoUpdate = $scope.emitGeoUpdate = function(lg, lt)
    {
      $scope.$emit('geoupdate', {lg: lg, lt: lt});
    }

    $scope.$on('geoupdate', function(event, args){

      //console.log(args);

      $scope.geoUpdateS(args);

    });




    
    //console.log("raww");

    require(["esri/map", "dojo/domReady!"], function(Map) { 
  var map = new Map("map", {
    center: [-118, 34.5],
    zoom: 8,
    basemap: "topo"
  });
});

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
