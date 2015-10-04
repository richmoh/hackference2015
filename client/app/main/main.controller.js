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

    $scope.minesDone = [];

    $scope.log = [];

    $scope.updateLocation = function(location)
    {
      console.log("LOCATION", location.coords.longitude);

      $scope.inputs.lg = location.coords.longitude;
      $scope.inputs.lt = location.coords.latitude;
$scope.$apply();
      //$scope.match();

      $scope.findMines();
    }  

    $scope.findMines = function(){
      var minesClose = 0;
      $scope.values.mines.forEach(function(mine){
        if($scope.minesDone.indexOf(mine)){
          var dist = $scope.theDistance($scope.inputs.lt,$scope.inputs.lg, mine.lt, mine.lg, "M");
          if(dist <= 5){
            minesClose ++;
            if(dist <= 1){
              $scope.minesDone.push(mine);
              alert("boom");
            }
            // var audio = new Audio('/audio/explosion2.mp3');
  // audio.play();
            // alert("boom");
          }
        }
        
      });
      $scope.values.mineCount = minesClose;
      $scope.$apply();
    }    

    $scope.loadMines = function()
    {

      $http.get('/api/beacons', {}).success(function(mines){

        $scope.values.mines = mines;
      });
    }

    $scope.loadMines();

    $scope.initFunc = function() {
     
      if( navigator.geolocation ) {  
        
        //console.log('rarrrra');

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

      $scope.findMines();


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


     //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    $scope.theDistance = function(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var radlon1 = Math.PI * lon1/180
  var radlon2 = Math.PI * lon2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="M") { dist = dist * 1609.344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
}

    // Converts numeric degrees to radians
    $scope.toRad = function(Value) 
    {
        return Value * Math.PI / 180;
    }
  });
