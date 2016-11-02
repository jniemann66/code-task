// flight-server.js (library; no entry-point)

var express = require('express');
var cors = require('cors');
var apiClient = require('./apiclient.js');
var morgan = require('morgan');

var app = express();

app.use(cors()); // allow CORS
app.use(morgan('dev'));

var server;

exports.start = function start(port, callback) {
  server = app.listen(port, callback);
};

exports.stop = function stop(callback) {
  server.close(callback);
};

// airport search
// usage: /airports?q=xxx

app.get ('/airports',
  function sendResponse(req, res) {
    apiClient.getAirportsFromAPI(req.query.q, function(err, data){
      if(err) {
        res.status(400).send('Sorry, unable to fulfil your request');
        return;
      }
    
      // copy the fields which are relevant to this project:
      var abridgedData = data.map(airport => ({
        airportCode: airport.airportCode,
        airportName: airport.airportName,
        cityName: airport.cityName,
        countryName: airport.countryName,
        stateCode: airport.stateCode
      }));
    
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(abridgedData));
    });
  }
);

// airline search
// usage: /airlines

app.get ('/airlines',
  function sendResponse(req, res) {
    apiClient.getAirlinesFromAPI(function(err, data) {
      if(err) {
        res.status(400).send('Sorry, unable to fulfil your request');
        return;
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(data));
    });
  }
);

// flight search: search for flights based on a combination of airlines and dates
// submits multiple requests to the API on behalf of the requestor, and consolidates the results
// usage: /flight_search?airline=a,b,c&date=x,y,z&from=sss&to=ddd

app.get ('/flight_search',
  function sendResponse(req, res) {

    if(!req.query.airline || !req.query.date) {
       res.status(400).send('Sorry, unable to fulfil your request');
       return;
    }

    var airlines = req.query.airline.split(',');
    var dates = req.query.date.split(',');

    // flatten all date and airline combinations into array:
    var dateAirlineCombinations = [];
    for(var i = 0; i < dates.length; ++i) {
      for(var j = 0; j < airlines.length; ++j) {
        dateAirlineCombinations.push({
          date: dates[i],
          airline: airlines[j], 
        });
      }
    }

    // perform a flight search for each date/airline combination:
    var results = dateAirlineCombinations.map(combo => getFlightsForSingleDay({
      airline: combo.airline,
      date: combo.date,
      from: req.query.from,
      to: req.query.to
    })); // results is an array of promises

    // gather and combine results, and send response:
    Promise.all(results).then(function(data) {
      var combinedData = [].concat.apply([], data); // merge results into a single array
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(combinedData));
    }).catch(function(err) {
      res.status(400).send('Sorry, unable to fulfil your request');
    });
  }
);

// getFlightsForSingleDay() : performs a flight search for a single day, and only retains fields relevant to project
// (asynchronous - returns a Promise)

function getFlightsForSingleDay (parameters) {
  return new Promise(
    function(resolve, reject) {
      apiClient.getFlightsFromAPI(parameters, function(err, data) {
        if(err) {
          reject(err);
        } else if(!data) {
          reject(new Error('No data'));
        } else {
          // copy the fields which are relevant to this project:
          var abridgedData = data.map(flight => ({ 
            key: flight.key,
            airline: { 
              code: flight.airline.code, 
              name: flight.airline.name 
            },
            flightNum: flight.flightNum,
            start: { 
              dateTime: flight.start.dateTime,
              airportCode: flight.start.airportCode,
              airportName: flight.start.airportName,
              cityName: flight.start.cityName,
              countryName: flight.start.countryName,
              stateCode: flight.start.stateCode,
              timeZone: flight.start.timeZone 
            },
            finish: { 
              dateTime: flight.finish.dateTime,
              airportCode: flight.finish.airportCode,
              airportName: flight.finish.airportName,
              cityName: flight.finish.cityName,
              countryName: flight.finish.countryName,
              stateCode: flight.finish.stateCode,
              timeZone: flight.finish.timeZone 
            },
            durationMin: flight.durationMin,
            price: flight.price 
          }));

          resolve(abridgedData);
        }
      });
    }
  )
}
