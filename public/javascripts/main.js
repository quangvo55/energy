//http://stackoverflow.com/questions/21318045/javascript-upload-and-read-xml-file-on-the-client-side
      function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList
        for (var i = 0, f; f = files[i]; i++) {

          var reader = new FileReader();

          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
              // Print the contents of the file
              gbJSONData = xmlToJson(parseXml(e.target.result));
              gbData(gbJSONData);
            };
          })(f);
          // Read in the file
          //reader.readAsDataText(f,UTF-8);
          reader.readAsText(f,"UTF-8");
        }
      }
      var allData = [];
      var dailyData = [];
      function gbData(gbJSONData) {
        var dataEntries = gbJSONData.feed.entry;
        for (var i=4; i<dataEntries.length-1; i++) {
            var intReadingsArr = dataEntries[i].content.IntervalBlock.IntervalReading;
              for (var j=0; j<intReadingsArr.length; j++) {
                allData.push(intReadingsArr[j].value['#text']);
              }
        }
        dayData(allData);
        dailyConsumption(dailyData);
      }
      function dayFill() {
        var arr = [];
        for (var i=0; i<365; i++) {arr.push([]);}
        return arr;
      }

      dailyData = dayFill();

      function dayData(allData) {
        allData.unshift(0);
        for (var i=1, j=0; i< allData.length; i++) {
          dailyData[j].push(allData[i]);
          if (i%24==0&&i!=0) j++;
        }
        for (var i=0; i<dailyData.length; i++) {
          dailyData[i] = dailyData[i].reduce(function(a, b) {return parseInt(a)+parseInt(b);},0)/1000
        }
      }

      function xmlToJson(xml) {
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
              obj[nodeName] = xmlToJson(item);
            } else {
              if (typeof(obj[nodeName].push) == "undefined") {
                var old = obj[nodeName];
                obj[nodeName] = [];
                obj[nodeName].push(old);
              }
              obj[nodeName].push(xmlToJson(item));
            }
          }
        }
        return obj;
      };

      window.onload = function() {
          if (window.DOMParser) {
            parseXml = function(xmlStr) {
                return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
            };
        } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
            parseXml = function(xmlStr) {
                var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xmlStr);
                return xmlDoc;
            };
        } else {
            parseXml = function() { return null; }
        }
      }
        

     document.getElementById('files').addEventListener('change', handleFileSelect, false);