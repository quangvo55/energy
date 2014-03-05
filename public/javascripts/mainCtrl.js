angular.module('energyApp', [])
	.controller('mainctrl', function($scope, $http) {
    $scope.utildata;
    $scope.pvdata;
    $scope.ajax1 = false;
    $scope.ajax2 = false;
    $scope.submit = function(energy) {
      var lat, lon;
      var google_api_key = 'AIzaSyB1rXlPri1LEFcjbySjyo3_q1Z8RuUPWpU';
      var googleurl = "https://maps.googleapis.com/maps/api/geocode/json?&sensor=true&key=" + google_api_key + "&address="
      +energy.addr1+" "+energy.city+","+energy.state+ " " + energy.zip;

      $http.get(googleurl).success(function(data, status, headers, config) {
          lat = data.results[0].geometry.location.lat;
          lon = data.results[0].geometry.location.lng;
      }).error(function(data, status, headers, config) {alert("There was an error processing your form");}).then(function() {
          var api_key = '6cdltAisWpaRxkOYMHNFB5c1IGWPc5NFUPXfX4T2';
        //Utility Rates
        var url = "http://developer.nrel.gov/api/utility_rates/v3.json?api_key=" + api_key + "&lat=" + lat + "&lon=" + lon;
        $http.get(url).success(function(data, status, headers, config) {
            $scope.utildata = data;
            $scope.ajax1 = true;
            loadUtilHC(data);
        }).error(function(data, status, headers, config) {alert("There was an error processing your form");});

        //PVWatts
        var pvwURl = "http://developer.nrel.gov/api/pvwatts/v4.json?api_key=" + api_key + "&system_size=4&derate=0.77&lat=" + lat + "&lon=" + lon;
        $http.get(pvwURl).success(function(data, status, headers, config) {
            $scope.pvdata = data;
            $scope.ajax2 = true;
            loadSolarHC(data);
        }).error(function(data, status, headers, config) {alert("There was an error processing your form");});
      });
    };
  });

