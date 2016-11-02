var flightServer = require ('../src/flight-server');

setTimeout(function(){
  flightServer.stop(function() {
    console.log('stopping');
  });
}, 1000);