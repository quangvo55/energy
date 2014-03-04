angular.module('energyApp', [])
	.controller('mainctrl', function($scope, $http) {
    $scope.utildata;
    $scope.pvdata;
    $scope.ajax1 = false;
    $scope.ajax2 = false;
    $scope.submit = function(energy) {
      //todo have to make sure form is in correct data
      var url = "http://developer.nrel.gov/api/utility_rates/v3.json?api_key=6cdltAisWpaRxkOYMHNFB5c1IGWPc5NFUPXfX4T2&";
      url += "address=" + energy.zip;
      $http.get(url).success(function(data, status, headers, config) {
          $scope.utildata = data;
          $scope.ajax1 = true;
      }).error(function(data, status, headers, config) {alert("There was an error processing your form");});

      //PVWatts
      var pvwURl = "http://developer.nrel.gov/api/pvwatts/v4.json?api_key=6cdltAisWpaRxkOYMHNFB5c1IGWPc5NFUPXfX4T2&system_size=4&derate=0.77&"
      pvwURl += "address=" + energy.zip;
      $http.get(pvwURl).success(function(data, status, headers, config) {
          $scope.pvdata = data;
          $scope.ajax2 = true;
      }).error(function(data, status, headers, config) {alert("There was an error processing your form");});
    };
  });