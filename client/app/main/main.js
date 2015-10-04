'use strict';

angular.module('hackference2015App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/minesweeper.html',
        controller: 'MainCtrl'
      });
  });