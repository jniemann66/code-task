const PORT = 3000;
const flightServer = require ('../src/flight-server');

try {
  flightServer.start(PORT, function(err) {
    console.log('started serving on port ' + PORT);
  });
}

catch(e) {
  console.log(e);
}