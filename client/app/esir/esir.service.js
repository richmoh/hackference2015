'use strict';

angular.module('hackference2015App')
  .service('esir', function ($q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var self = {
    	Point : null,
    	SimpleMarkerSymbol: null,
    	SimpleLineSymbol:null,
    	Graphic: null,
    	Color: null,
    	Map: null,
    	theMap:null,
    	scope: null,
    	beacons:[],
    	initESIR: function(scope, elementId){
    		var deferred = $q.defer();

    		self.scope = scope;
    		require(["esri/map", "esri/geometry/Point", 
		        "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
		        "esri/graphic", "esri/Color","esri/dijit/PopupMobile", "dojo/domReady!" ], function(Map, Point,
		        SimpleMarkerSymbol, SimpleLineSymbol,Graphic, Color, PopupMobile)
		    { 
		    	self.Map = Map;
		    	self.Point = Point;
		    	self.SimpleMarkerSymbol = SimpleMarkerSymbol;
		    	self.SimpleLineSymbol = SimpleLineSymbol;
		    	self.Graphic = Graphic;
		    	self.Color = Color;
		    	self.PopupMobile = PopupMobile;
		    	

				self.theMap = new Map(elementId, {
					center: [-118, 34.5],
					zoom: 250,
					basemap: "topo",
					infoWindow:popup
				});

				deferred.resolve();

		    });
		    return deferred.promise;
    	},
    	setBeacons: function(beacons){
    		var obeacons = beacons;
    		var ids = $.map(obeacons, function(item){return item._id;});
    		self.beacons.forEach(function(beacon,key){
    			var index = ids.indexOf(beacon._id);
    			if(index !== -1){
    				var spliced = obeacons.splice(index,1);
    				var pt = new self.Point(spliced.lg, spliced.lt);
    				beacon.graphic.setGeometry(pt);
    			} else {
    				self.theMap.graphics.remove(beacon.graphic);
    				obeacons.splice(key,1);
    			}
    		});

    		obeacons.forEach(function(beacon){
    			console.log(beacon.lg, beacon.lt);
    			var pt = new self.Point(beacon.lg, beacon.lt);
    			console.log("pt",pt);
    			var new_beacon = self.addBeacon(beacon, pt);
    			self.beacons.push(new_beacon);
    		})
    	},
    	zoomToLocation: function(location) {

          var pt = new self.Point(location.coords.longitude, location.coords.latitude);
          self.addSelf(pt);
          self.theMap.centerAndZoom(pt, 20);
        },
        addSelf: function(pt){
          var symbol = new self.SimpleMarkerSymbol(
            self.SimpleMarkerSymbol.STYLE_CIRCLE, 
            12, 
            new self.SimpleLineSymbol(
              self.SimpleLineSymbol.STYLE_SOLID,
              new self.Color([210, 105, 30, 0.5]), 
              8
            ), 
            new self.Color([210, 105, 30, 0.9])
          );
          self.selfgraphic = new self.Graphic(pt, symbol);
          console.log(self.selfgraphic);
          self.theMap.graphics.add(self.selfgraphic);
        },
        addBeacon: function(beacon,pt){
          var symbol = new self.SimpleMarkerSymbol(
            self.SimpleMarkerSymbol.STYLE_CIRCLE, 
            12, 
            new self.SimpleLineSymbol(
              self.SimpleLineSymbol.STYLE_SOLID,
              new self.Color([210, 105, 30, 0.5]), 
              8
            ), 
            new self.Color([210, 105, 30, 0.9])
          );

      //     new Graphic({"geometry":{"x":-89999000,"y":5192000,
      // "spatialReference":{"wkid":102113}},"attributes":{"w":"content",
      // "a":"content","b":"content","c":"content"}});

          beacon.graphic = new self.Graphic(pt, symbol);
          console.log(beacon);
          self.theMap.graphics.add(beacon.graphic);
          return beacon;
        },

        removeSelf: function(){
        	self.theMap.graphics.remove(self.selfgraphic);
        },
        cleanBeacons: function(){

        },
        showLocation: function(location) {
          //zoom to the users location and add a graphic
          var pt = new self.Point(location.coords.longitude, location.coords.latitude);
          console.log(location.coords.longitude, location.coords.latitude);
          if ( !self.selfgraphic ) {
            self.addSelf(pt);
          } else { // move the graphic if it already exists
            self.selfgraphic.setGeometry(pt);
          }
          self.theMap.centerAt(pt);
        }

    }

    return self;
    


  });
