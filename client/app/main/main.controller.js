'use strict';

var emitGeoUpdate = null;

angular.module('hackference2015App')
  .controller('MainCtrl', function ($scope, $http, socket, $cookieStore, User, esir) {
    $scope.watchId = null;

    $scope.map = $scope.Point = $scope.SimpleMarkerSymbol = $scope.SimpleLineSymbol = 
        $scope.Graphic = $scope.Color= null;
    

    $scope.inputs = {
      //52.475903, -1.888465
      //52.476833, -1.892256
      //52.476709, -1.891624
      //52.475859, -1.893555
      lg: -1.893555,
      lt: 52.475859,
      beaconText: '',
      searchText: ''

    };

    $scope.values = {
      mineCount: 0,
      mines: []
    };

    $scope.log = [];

    $scope.updateLocation = function(location)
    {
      console.log("LOCATION", location.coords.longitude);

      $scope.inputs.lg = location.coords.longitude;
      $scope.inputs.lt = location.coords.latitude;

      $scope.match();
    }    

    $scope.initFunc = function() {
     
      if( navigator.geolocation ) {  
        
        console.log('rarrrra');

        navigator.geolocation.getCurrentPosition($scope.updateLocation, function(){console.log('err')}, {maximumAge:500, timeout:500, enableHighAccuracy: true});
        //$scope.watchId = navigator.geolocation.watchPosition(esir.showLocation, function(){console.log('err')});

        $scope.watchId = navigator.geolocation.watchPosition($scope.updateLocation, function(){console.log('err')}, {maximumAge:500, timeout:500, enableHighAccuracy: true});
      
      } else {
        alert("Browser doesn't support Geolocation. Visit http://caniuse.com to see browser support for the Geolocation API.");
      }
    }

    $scope.initFunc();

    

window.s = $scope;
    $scope.setBeacons = function(beacons){
      esir.setBeacons(beacons);
    }
    // $scope.tt = "hi";
    // $scope.test = function(){
    //   if( navigator.geolocation ) {  
        
    //     setTimeout(function(){
    //       navigator.geolocation.getCurrentPosition(function(i){
    //         $scope.tt = i.coords.latitude + " , " + i.coords.longitude;
    //         $scope.test();
    //       }, function(){console.log('err')});
          
    //     },2000);
        
    //     // watchId = navigator.geolocation.watchPosition(showLocation, locationError);
    //   } else {
    //     alert("Browser doesn't support Geolocation. Visit http://caniuse.com to see browser support for the Geolocation API.");
    //   }
    // };
    // $scope.test();
    // return;


    $scope.awesomeThings = [];

    

    $scope.beacons = {
      usersWithBeacons: [],
      mine: []
    };

    User.get().$promise.then(function(user){
        
      $scope.beacons.mine = user.beacons;

    });

    console.log(User.get());

    // socket.socket.on('userGeoUpdate', function(data){

    //   console.log("Update via sockets");

    //   //I need to get the beacons
    //   console.log(data);
    //   //$scope.log.push('User update: '+data);

    //   $scope.beacons.usersWithBeacons = data.users;


    //   //console.log(, data);
    // });

    socket.socket.on('update mines', function(data){

      console.log("Update via sockets");

      //I need to get the beacons
      console.log(data);
      //$scope.log.push('User update: '+data);

      $scope.values.mines = data;


      //console.log(, data);
    });

    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    //   socket.syncUpdates('thing', $scope.awesomeThings);
    // });

    $scope.placeMine = function() {
      
      console.log('called place mine');


      $scope.geoUpdateS($scope.inputs);

      //reate mine
      // $http.post('/api/beacon', $scope.inputs).success(function(){

      //   //$scope.beacons.mine.push($scope.inputs.beaconText);
        
      //   alert('Mine added at.. ', $scope.inputs);

      // });

      
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
      
      socket.socket.emit('planting mine', args, function(){
        console.log('Added mine');
      });


      // User.get().$promise.then(function(user){
        
      //   //console.log('test2',user._id);

      //   args.userId = user._id;

        

      // });

      
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
    // var promise = esir.initESIR($scope, "map");
    // promise.then(function() {
    //   $scope.initFunc();
    // });

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
