var app = angular.module('energyApp', []);

app.config(function($httpProvider) {
  $httpProvider.interceptors.push(function() {
    return {
      'request': function(config) {
         document.body.style.cursor = "progress";
         return config;
      },
      'response': function(response) {
        setTimeout(function(){document.body.style.cursor = 'default';},1000);
        return response;
      }
    };
  });
});

app.service('apiService', function($http) {
  this.google_api_key = 'AIzaSyB1rXlPri1LEFcjbySjyo3_q1Z8RuUPWpU',
  this.nrel_api_key = '6cdltAisWpaRxkOYMHNFB5c1IGWPc5NFUPXfX4T2',
  this.getCoords = function(address) {
    return $http({
      method: 'GET',
      url: 'https://maps.googleapis.com/maps/api/geocode/json?',
      params: {
        sensor: true,
        key: this.google_api_key,
        address: address
      }
    }).error(function(data, status, headers, config) {
      console.log(data);
      alert(data);
    });
  },
  this.getUtil = function(lat, lon) {
    return $http({
      method: 'GET',
      url: 'http://developer.nrel.gov/api/utility_rates/v3.json?',
      params : {
        api_key : this.nrel_api_key,
        lat : lat,
        lon : lon
      }
    });
  },
  this.getPV = function(lat, lon) {
    return $http({
      method: 'GET',
      url: 'http://developer.nrel.gov/api/pvwatts/v4.json?',
      params : {
        api_key : this.nrel_api_key,
        system_size : 4.05,
        derate: 0.77,
        lat : lat,
        lon : lon
      }
    });
  },
  this.getTarriffs = function(utilName) {
    return $http({
      method: 'GET',
      url: 'ladwp.json',
    });
  }
});

app.controller('mainCtrl', function($scope, $http, apiService, dataService) {
    $scope.data = null;
    $scope.utilName;
    $scope.showGraphs = false;
    $scope.addy = false;
    $scope.dctotal;
    $scope.gbGraph = false;
    $scope.enterAddress = function() {
      $scope.addy = true;
    };
    $scope.getData = function(lat, lon) {
      apiService.getUtil(lat, lon).then(function(res) {
        $scope.showGraphs = true;
        $scope.utilName = res.data.outputs.utility_name;
        loadUtilHC(res.data);
        $(window).resize();
      });
      apiService.getPV(lat, lon).then(function(res) {
        loadSolarHC(res.data);
        $(window).resize();
        solarData = res.data;
        $scope.dctotal = (res.data.outputs.dc_monthly.reduce(function(a, b) {return parseInt(a)+parseInt(b);},0)/1000).toFixed(2);
      });
    };
    $scope.geo = function() {
      $scope.addy = false;
      navigator.geolocation.getCurrentPosition(function(data) {
      var lat = data.coords.latitude;
      var lon = data.coords.longitude;
      $scope.getData(lat, lon);
      });
    };
    $scope.submit = function(energy) {
      $scope.addy = false;
      var address = energy.addr1+" "+energy.city+","+energy.state+ " " + energy.zip;
      apiService.getCoords(address).then(
        function(res) {
          lat = res.data.results[0].geometry.location.lat;
          lon = res.data.results[0].geometry.location.lng;
          $scope.getData(lat, lon);
      });
    };
    $scope.gbUpload = function() {
      $http.get('coastal.xml').success(function(data) {
        var xml = (new window.DOMParser()).parseFromString(data, "text/xml");
        gbJSONData = dataService.xmlToJson(xml);
        dataService.parseGBData(gbJSONData);
        $scope.gbGraph = true;
        $scope.annualCon = "Annual Energy Usage: " + dataService.annualCon + " kW";
        $scope.savings = dataService.yearTotal;
      });
    };
});

app.service('dataService', function($http) {
  this.allData = [], this.dailyData = [],
  this.daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31],
  this.monthlyData = [], this.monthlyCost = [], this.monthlyTotal = [],
  this.solarData, this.yearTotal, this.annualCon;

  this.indexFill = function(max) {
    var arr = [];
    for (var i=0; i<max; i++) arr.push([]);
    return arr;
  };

  this.parseGBData = function(gbJSONData) {
    var self = this;
    self.dailyData = self.indexFill(365);
    self.monthlyData = self.indexFill(12);
    var dataEntries = gbJSONData.feed.entry;
    //get all data points into one array
    for (var i=4; i<dataEntries.length-1; i++) {
        var intReadingsArr = dataEntries[i].content.IntervalBlock.IntervalReading;
          for (var j=0; j<intReadingsArr.length; j++) {
            self.allData.push(intReadingsArr[j].value['#text']);
          }
    }
    self.allToDayData(self.allData);
    dailyConHC(self.dailyData); //highcharts
    self.dailyToMonthData(self.dailyData);
    self.costPerMonth(self.monthlyData);
    loadSolarHC(solarData, self.monthlyTotal);
    $(window).resize();
    self.annualCon = (self.monthlyTotal.reduce(function(a, b) {return parseInt(a)+parseInt(b);})/1000).toFixed(2);
    self.yearTotal = self.monthlyCost.reduce(function(a, b) {return parseInt(a)+parseInt(b);});
    
  };

  this.allToDayData = function(allData) {
    var self = this;
    self.allData.unshift(0);
    for (var i=1, j=0; i< self.allData.length; i++) {
      self.dailyData[j].push(allData[i]);
      if (i%24==0&&i!=0) j++;
    }
    for (var i=0; i<self.dailyData.length; i++) {
      self.dailyData[i] = self.dailyData[i].reduce(function(a, b) {return parseInt(a)+parseInt(b);},0)/1000
    }
  };

  this.dailyToMonthData = function(dailyData) {
    var self = this;
    for (var i=0;i<self.daysInMonth.length; i++) {
      self.monthlyData[i] = self.dailyData.splice(0, self.daysInMonth[i]);
    }
  };

  this.costPerMonth = function(monthlyData) {
    var self = this;
    //tariff rates
    var rate2Months = [6,7,,8,9];
    var t1Rate = .07;
    var t2Rate = [.07, .085, .12];
    for (var i=0; i< self.monthlyData.length; i++) {
      self.monthlyTotal[i] = self.monthlyData[i].reduce(function(a, b) {return parseInt(a)+parseInt(b);},0);
      var total = 0;
      var etotal = 0;
      if (rate2Months.indexOf(i) == -1) {
          for (var j=0; j<self.monthlyData[i].length;j++) {
            total += self.monthlyData[i][j] * t1Rate;
          }
      } else {
        for (var j=0; j<self.monthlyData[i].length;j++) {
          if (0 < etotal && etotal < 350) {
            total += self.monthlyData[i][j] * t2Rate[0];
          } else if ( 350 < etotal && etotal < 1050) {
            total += self.monthlyData[i][j] * t2Rate[1];
          } else if (etotal > 1050) {
            total += self.monthlyData[i][j] * t2Rate[2];
          }
          etotal += self.monthlyData[i][j];
        }
      }
      self.monthlyCost.push(total);
    }
    console.log('done');
  };

  this.xmlToJson = function(xml) {
    var self = this;
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
      // do attributes
      if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) { // text
      obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
      for(var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof(obj[nodeName]) == "undefined") {
          obj[nodeName] = self.xmlToJson(item);
        } else {
          if (typeof(obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(self.xmlToJson(item));
        }
      }
    }
    return obj;
  };


});