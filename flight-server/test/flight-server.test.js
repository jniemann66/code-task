var expect = require('chai').expect;
var request = require('superagent');
var moment = require('moment'); 

describe('API retrieval functions', function() {
  var apiClient = require('../src/apiclient');
  describe('when calling the getAirportsFromAPI() function', function(){
    it('should return an array of airports', function(done) {
      apiClient.getAirportsFromAPI('Melbourne', function(err, data) {
        expect(data).to.be.an('Array').with.length.above(0);
        expect(data[0]).to.have.property('airportName');
        expect(data[0]).to.have.property('cityCode');
        expect(data[0]).to.have.property('cityName');
        expect(data[0]).to.have.property('countryCode');
        expect(data[0]).to.have.property('countryName'); 
        done();
      });
    });
  });

  describe('when calling the getAirlinesFromAPI() function', function() {
    it('should return an array of airlines', function(done) {
      apiClient.getAirlinesFromAPI(function(err,data) {
        expect(data).to.be.an('Array').with.length.above(0);
        done();
      });
    });
  });

  describe('when calling the getFlightsFromAPI() function', function() {
    it('should return flight data', function(done) {
      this.timeout(10000); // this query needs a bit of time !
      apiClient.getFlightsFromAPI({airline: 'QF', date: '2016-12-25', from: 'SYD', to: 'JFK'}, function(err, data) {
        expect(data).to.be.an('Array').with.length.above(0);
        done();
      });
    });
  });

  describe('when querying for a non-existent airport, the getAirportsFromAPI() function', function(){
    it('should return an empty array', function(done) {
      apiClient.getAirportsFromAPI('This-airport-should-not-exist', function(err, data) {
        expect(data).to.be.empty;
        done();
      });
    });
  });
});

describe('Flight Server', function() {
  var flightServer = require ('../src/flight-server');
  var port = 9000;
  var baseUrl = 'http://localhost:' + port;

  before(function(done) {
    flightServer.start(port, done);
  });

  after(function(done) {
    flightServer.stop(done);
  });

  describe('when requesting home page', function() {
    it('should get index.html', function(done){
      request.get(baseUrl + '/').end(function assert(err, res) {
        expect(res).to.have.property('status', 200);
        expect(res).to.have.property('type', 'text/html');
        expect(res.text).to.contain('<html>');
        done();
      });
    });
  });

  describe('when sending a request to /airports?q=Melbourne', function() {
    it('should return an array of airports matching the query', function(done) {
      request.get(baseUrl + '/airports?q=Melbourne').end(function assert(err, res) {
        expect(res).to.have.property('status', 200);
        expect(res.body).to.be.an('Array').with.length.above(0);
        expect(res.body[0]).to.have.property('airportCode');
        expect(res.body[0]).to.have.property('airportName');
        expect(res.body[0]).to.have.property('cityName');
        expect(res.body[0]).to.have.property('countryName');
        expect(res.body[0]).to.have.property('stateCode');
        done();
      });
    });
  });

  describe('when sending a request to /airlines', function() {
    it('should return an array of airlines', function(done) {
      request.get(baseUrl + '/airlines').end(function assert(err, res) {
        expect(res).to.have.property('status', 200);
        expect(res.body).to.be.an('Array').with.length.above(0);
        
        res.body.forEach(function(airline){
          expect(airline).to.have.property('code');
          expect(airline).to.have.property('name');
        });     
    
        done();
      });
    });
  });

  // initialize testing variables for flight search:
  var airlineStr = 'SU,MU,EK,KE,QF,SQ'; 
  // create a range of dates:
  var targetDate = moment().add(14,'days').format('YYYY-MM-DD'); // fortnight from now
  var dates = [];
  for(var i = -2; i<= 2; i++) {
    dates.push(moment(targetDate).add(i, 'day').format('YYYY-MM-DD'));
  }
  var dateStr = dates.join(',');

  describe('when sending a request for flights', function() {
    it('should return an array of flights, with the correct fields', function(done) {
       this.timeout(20000); // this query needs a bit of time !
        request.get(baseUrl + '/flight_search?airline=' + airlineStr + '&date=' + dateStr + '&from=SYD&to=JFK').end(function assert(err, res) {
        expect(res.body).to.be.an('Array');
        expect(res.body[0]).to.have.property('key');
        expect(res.body[0]).to.have.property('airline');
        expect(res.body[0]).to.have.property('flightNum');
        expect(res.body[0]).to.have.property('start');
        expect(res.body[0]).to.have.property('finish');
        expect(res.body[0]).to.have.property('durationMin');
        expect(res.body[0]).to.have.property('price');
        done();
      });
    });
  });

  describe('when sending a malformed request (unrecognized query params)', function() {
    it('the server should return a status 400', function(done) {
      request.get(baseUrl + '/flight_search?bad_request').end(function assert(err, res) {
        expect(res).to.have.property('status', 400);
        done();
      });
    });
  });

  describe('when sending a malformed request (no airlines specified)', function() {
    it('the server should return a status 400', function(done) {
      request.get(baseUrl + '/flight_search?airline=' + '&date=' + dateStr + '&from=SYD&to=JFK').end(function assert(err, res) {
        expect(res).to.have.property('status', 400);
        done();
      });
    });
  });

  describe('when sending a malformed request (no dates specified)', function() {
    it('the server should return a status 400', function(done) {
      request.get(baseUrl + '/flight_search?airline=' + airlineStr + '&date=' + '&from=SYD&to=JFK').end(function assert(err, res) {
        expect(res).to.have.property('status', 400);
        done();
      });
    });
  });

  describe('when sending a malformed request (non-existent airline)', function() {
    it('the server should return a status 400', function(done) {
      request.get(baseUrl + '/flight_search?airline=xx,QF' + '&date=' + '&from=SYD&to=JFK').end(function assert(err, res) {
        expect(res).to.have.property('status', 400);
        done();
      });
    });
  });

  describe('when sending a malformed request (date in the past)', function() {
    it('the server should return a status 400', function(done) {
      request.get(baseUrl + '/flight_search?airline=QF' + '&date=2009-07-11' + '&from=SYD&to=JFK').end(function assert(err, res) {
        expect(res).to.have.property('status', 400);
        done();
      });
    });
  });

});