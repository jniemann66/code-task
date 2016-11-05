var http = require('http');
var apiHost = 'node.locomote.com';

module.exports = {

  // function to get an array of airports from the API
  getAirportsFromAPI: function (airportName, callback) {
      var path = '/code-task/airports?q=' + airportName;
      getJSON(path, callback);
  },

  // function to get an array of airlines from the API
  getAirlinesFromAPI: function (callback) {
      var path = '/code-task/airlines';
      getJSON(path, callback);
  },

  // function to get an array of flights from the API
  getFlightsFromAPI: function (parameters, callback) {  
      var path = '/code-task/flight_search/' + parameters.airline + 
          '?date=' + parameters.date +
          '&from=' + parameters.from +
          '&to=' + parameters.to;
      getJSON(path, callback);
  }

};


// generic fetch function to retrieve JSON as JS Object from Locomote code-task API
function getJSON(path, callback) {
    
    var options = {
        host: apiHost, 
        port: 80, 
        path: encodeURI(path), 
        method: 'GET', 
        headers: {'Content-Type': 'application/json'}
    };

    var req = http.request(options, function(res) {
        var data = '';
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            if(res.statusCode === 200) { 
              callback(null, JSON.parse(data));
            } else {
              callback(new Error('problem retrieving from API'), null);
            }
        });

    }).on('error', function(err) {
        callback(err, null);
    });

    req.end();
}

