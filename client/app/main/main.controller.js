'use strict';

angular.module('hackference2015App')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.awesomeThings = [];

    $scope.inputs = {

      lg: '12',
      lt: '12',
      beaconText: 'Selling Lego',
      searchText: 'Lego'

    };

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $http.get('/api/beacons').success(function(mybeacons) {
      $scope.mybeacons = mybeacons;
      socket.syncUpdates('beacon', $scope.mybeacons);
    });

    $scope.addBeacon = function() {
      if($scope.inputs.beaconText === '') {
        return;
      }

      $http.post('/api/beacons', { 

        text: $scope.inputs.beaconText, 
        lg: $scope.inputs.lg,
        lt: $scope.inputs.lt

      });

      $scope.inputs.newBeacon = '';
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
