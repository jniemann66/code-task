var flightServer = require ('../src/flight-server');

try {
  flightServer.start(9000, function(err) {
    console.log('started');
  });
}

catch(e) {
  console.log(e);
}