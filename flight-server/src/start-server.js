var flightServer = require ('../src/flight-server');

try {
  flightServer.start(3000, function(err) {
    console.log('started');
  });
}

catch(e) {
  console.log(e);
}