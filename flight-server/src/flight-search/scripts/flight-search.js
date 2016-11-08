// This is the flight-search front-end application

(function() {

  // constants:

  var serverAddress = 'http://localhost:3000'; // for AJAX requests (hard-coded)
  // var serverAddress = 'http://' + window.location.host; // auto-detect

  var searchExpiry = 5; // maximum age for search results in minutes. Sorting will trigger re-search if results have expired.

  // flags:
  var hasDatalist; // for detection of browser support for <datalist> element

  // Initialisation ////

  // window.onload() - entry point
  window.onload = function() {

    // conditionally install jQueryUI date picker for browsers that don't have <input type="date">
    // (browsers that DO have <input type="date"> will use their native implementation.)
    if ( $('[type="date"]').prop('type') != 'date' ) {
      installDatePicker('dd-M-yy'); // note: with jQui datepicker, 'yy' is 4-digit year  
    }   

    // detect if browser supports the html5 <datalist> element
    hasDatalist =  !!(document.createElement('datalist') && window.HTMLDataListElement);

    // invalidate any stored results:
    sessionStorage.setItem('lastResultDirty', JSON.stringify(true));

    // initialise event listeners:

    // DOM events:
    document.getElementById("from").addEventListener("keyup", autocompleteAirport);
    document.getElementById("from").addEventListener("change", handleAirportChange);
    document.getElementById("to").addEventListener("keyup", autocompleteAirport);
    document.getElementById("to").addEventListener("change", handleAirportChange);
    document.getElementById("search").addEventListener("click", search);

    // jQuery events:
    $("#date").on("change", handleDateChange);
    $(".sort-buttons").click(onClickSort);
    $("#resultsbox").on( "click", "button", onClickResult);

  }

  // installs a jQueryUI datepicker in place of <input type="date">:
  function installDatePicker(displayFormat) {
    $('input[type=date]').each(function (index, element) {
      var hiddenDate = $(this).clone().insertAfter(this).hide(); // create hidden date field that will contain the iso 8601 date format
      $(this).attr('id',$(this).attr('id')+'-displayed'); // append '-displayed' to the id of the date field which the user sees
      $(this).datepicker({ 
        dateFormat: 'dd-M-yy', 
        altField: '#' + hiddenDate.attr('id'), 
        altFormat: 'yy-mm-dd', // full-date as specified in RFC3339 (note: 'yy' is actually 4-digit year in datepicker)
        onSelect: function() { 
          hiddenDate.trigger("change"); 
        } // make datepicker fire a change event when underlying input changed (doesn't do this by default)
      }); 
    });
  }

  // event handlers ////

  // does an AJAX search and populates dropdown selections based on what user typed: 
  function autocompleteAirport(evt) {
    var text = evt.target.value;
    if(text.length >= 2 ) { // do an airport lookup if user has entered 2 or more characters
      getJSON('/airports?q=' + text, function(airportList) {
        if(airportList) {

          // build auto-complete sources:
          var acSources = airportList.map(function(airport) {
            return airport.cityName +', ' + airport.countryName + ' (' + airport.airportCode + ')';
          });

          if(hasDatalist){ // html5 <datalist>
            var datalist = document.getElementById(evt.target.getAttribute('list')); // get <datalist> asscociated with this input
            datalist.innerHTML='';
            acSources.forEach(function(src) {
              var option = document.createElement('option');
              option.value = src;
              datalist.appendChild(option);
            });
          } else { // jQueryUI autocomplete
            $(evt.target).autocomplete({source: acSources});
          }
        }
      });
    }
  }

  function handleAirportChange(evt) {
    // invalidate any stored results:
    sessionStorage.setItem('lastResultDirty', JSON.stringify(true));

    validateAirportInput(evt);
  }

  function handleDateChange(evt) {
    // invalidate any stored results:
    sessionStorage.setItem('lastResultDirty', JSON.stringify(true));

    validateDateInput(evt);
  }

  // validation functions ////

  // validates the airport (value must contain 3-letter airport code in parentheses),
  // and sets bootstrap form-control classes accordingly
  // evt = event that triggered validation

  function validateAirportInput(evt) {

  if(evt.target.value.length===0) {
      $(evt.target).parent().removeClass('has-error has-success');
    } else if(/\(([A-Z]*)\)/.test(evt.target.value)) { // found 3-letter airport code in parentheses
      $(evt.target).parent().removeClass('has-error').addClass('has-success');
    } else {
      $(evt.target).parent().removeClass('has-success').addClass('has-error');
    }
  }

  // validates date input (date cannot be in the past)
  // and sets bootstrap form-control classes accordingly
  // evt = event that triggered validation

  function validateDateInput(evt) {

    var today = moment();
    var targetDate = moment(document.getElementById("date").value);
    var diff = moment.duration(targetDate.diff(today)).asDays(); // determine difference between target date and today
    
    if(diff < 0) {
      $(evt.target).parent().removeClass('has-success').addClass('has-error');
    } else {
      $(evt.target).parent().removeClass('has-error').addClass('has-success');
    }
  }

  // Handles sorting, upon user clicking one of the sort buttons. 
  // Triggers full search if stored results are dirty or expired

  function onClickSort(evt) {

    var lastDates = JSON.parse(sessionStorage.getItem('lastDates'));
    var lastResult = JSON.parse(sessionStorage.getItem('lastResult'));
    var lastResultTime = JSON.parse(sessionStorage.getItem('lastResultTime'));
    var lastResultDirty = JSON.parse(sessionStorage.getItem('lastResultDirty'));

    var age = moment.duration(moment().diff(moment(lastResultTime))).asMinutes();

    if(age > searchExpiry || lastResultDirty) { 
      search(); // search again
    } else { // stored search ok - just sort it and display it
      clearFlights();
      var selectedDayTab = Number($("input[name='tabs']:checked").val()); // remember selected tab, for re-display
      var sortMode = $("input[name='sort-mode']:checked").val();
      var descending = !!document.getElementById('descending').checked;
      var flightsSorted = sortFlights(lastResult, sortMode, descending);
      showFlights(flightsSorted, lastDates, selectedDayTab);
    }
  }

  // function to handle selection of a flight:
  function onClickResult(evt) {

    // Note: this is just a stub. In real life, this would initiate an approval process ... 
    // probably starting with with a relevant ajax query to server
    
    var id = $(evt.target).attr("id");
    var lastResult = JSON.parse(sessionStorage.getItem('lastResult'));
    var lastResultTime = JSON.parse(sessionStorage.getItem('lastResultTime'));
    var lastResultDirty = JSON.parse(sessionStorage.getItem('lastResultDirty'));
    var age = moment.duration(moment().diff(moment(lastResultTime))).asMinutes();

    if(age > searchExpiry || lastResultDirty) {
      alert('Results have expired, due to inactivity.\nPlease refresh your search');
      return;
    }
    
    var selectedFlight = lastResult.filter(function(flight){
      return flight.key === id;
    })[0];
   
    var newPage = window.open("");
    
    var confirmationHTML = '<html><head>' +
      '<meta content="width=device-width, initial-scale=1" name="viewport">' +
      '<link rel="stylesheet" type="text/css" href="../styles/confirmation.css">' +
      '<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">' + 
      '<title>Flight Details</title></head>' +

      '<body><div class="container-fluid"><div class="col-sm-1"></div>' +
      '<div  col-sm-10"><h2 id="main-heading">Confirm Flight Details</h2><table>' + 
      '<thead><th colspan="2">Flight details:</th></thead>' +
      '<tr><td>Airline:</td><td>' + selectedFlight.airline.name + '</td></tr>' + 
      '<tr><td>Flight Number:</td><td>' + selectedFlight.flightNum + '</td></tr>' +
      '<tr><td>Origin:</td><td>' + formatDateForResults(selectedFlight.start.dateTime) + '<p>' + selectedFlight.start.airportCode + '</p>' + '</td></tr>' +
      '<tr><td>Destination:</td><td>' + formatDateForResults(selectedFlight.finish.dateTime) + '<p>' + selectedFlight.finish.airportCode + '</p>' + '</td></tr>' +
      '<tr><td>Price:</td><td>' + 'AU $' + selectedFlight.price + '</td></tr>' + 
      '</table>' + 
      '<p><button class="btn-success" type="button" onclick="alert(\'Flight submitted for approval !\')" name="confirm">confirm</button></p>' + 
      '</div><div class="col-sm-1"></div></div></body></html>';

    newPage.document.write(confirmationHTML);
  }

  // UI manipulation functions ////

  // starts search animation to indicate to user that search is underway:
  function startSearchAnimation() {
    var btn = document.getElementById("search"); 
    btn.style.animation = "glowing 1800ms infinite";
  }

  // stops search animation:
  function stopSearchAnimation() {
    var btn = document.getElementById("search");
    btn.style.animation = "none";
  }

  // clears previous search results from page
  function clearFlights() {
    document.getElementsByClassName('tabs')[0].style.display = 'none';
    for(var day = 1; day <=5; day++) {
      var tableArea = document.getElementById('tab-content' + day);
      var oldTable = tableArea.getElementsByTagName('table')[0];
      if(oldTable) {
        tableArea.removeChild(oldTable);
      }
    }
  }

  // shows search results for five days
  // flights: array of flights
  // dates: array of dates to be displayed
  // selectedDay: tab number corresponding to user's requested date (1-5)

  function showFlights(flights, dates, selectedDay) {

    document.getElementsByClassName('tabs')[0].style.display = 'block'; // unhide results

    for(var day = 1; day <= 5; day++) {
      
      // set labels and headings:
      var label = document.getElementById('label' + day);
      var resultHeading = document.getElementById('results-heading' + day);
  
      label.innerHTML = moment(dates[day-1]).format('DD-MMM-YYYY');;
      resultHeading.innerHTML = moment(dates[day-1]).format('dddd, MMMM Do, YYYY');;

      // filter list for specific day:
      var flightsForDay = flights.filter(function(flight) {
      return moment(flight.start.dateTime).format('YYYY-MM-DD') === dates[day-1];
      });
      
      // generate table:
      var tableArea = document.getElementById('tab-content' + day);
      var tableElem = document.createElement('table');

      // generate header:
      var headings = ['Airline / Flight Details', 'Departs', 'Travel Time', 'Arrives', 'Price'];
      var headerElem = document.createElement('thead');  
      for (var i = 0; i < headings.length; i++) {
        headerElem.appendChild(document.createElement('th')).appendChild(document.createTextNode(headings[i]));
      }
      tableElem.appendChild(headerElem);

      // generate cells:
      for (var f = 0; f < flightsForDay.length; f++) {
        var tr = document.createElement('tr');
        
        // airline name and flight details:
        tr.appendChild(document.createElement('td')).innerHTML = formatAirlineFlightDetails(flightsForDay[f]);
        
        // departure dteails (time, date, timezone, airport code):
        tr.appendChild(document.createElement('td')).innerHTML = formatDateForResults(flightsForDay[f].start.dateTime) +
          '<p>' + flightsForDay[f].start.airportCode + '</p>';

        // flight duration:
        tr.appendChild(document.createElement('td')).innerHTML = formatMinsToHrsMins(flightsForDay[f].durationMin);
        
        // arrival details (time, date, timezone, airport code):
        tr.appendChild(document.createElement('td')).innerHTML = formatDateForResults(flightsForDay[f].finish.dateTime) +
          '<p>' + flightsForDay[f].finish.airportCode + '</p>';
        
        // price, and book button ...
        tr.appendChild(document.createElement('td')).innerHTML = '<p>AU $ ' + flightsForDay[f].price +'</p>' +
          '<button type="button" id="' + flightsForDay[f].key + '" class="btn btn-sm btn-success">Select</button>';
      
        tableElem.appendChild(tr);
      }

      tableArea.appendChild(tableElem);
    }

    // activate the tab corresponding to the user's target date:
    targetDateTab = document.getElementById("tab" + selectedDay);
    targetDateTab.checked = true;
  } 

  // search and sort functions ////

  // performs a flight search, based on search criteria entered by user
  function search() {
    clearFlights();
    var fromVal = document.getElementById('from').value;
    var toVal = document.getElementById('to').value;

    if(!fromVal || !toVal) {
      return;
    }

    var from = fromVal.match( /\(([A-Z]*)\)/ )[1]; // match stuff inside parentheses, and capture the stuff inside parentheses
    var to = toVal.match( /\(([A-Z]*)\)/ )[1];
    
    var targetDate = moment(document.getElementById("date").value);
     
    if(!targetDate.isValid()) {
      return; // invalid date
    }

    var today = moment().format('YYYY-MM-DD');
    
    var diff = moment.duration(targetDate.diff(today)).asDays(); // determine difference between target date and today
    
    if(diff < 0) { 
      alert("Sorry - can't book flights in the past !");
      return;
    }
    
    var dateRangeOffset = diff < 2 ? -diff : -2; // ensure that date range never extends into the past 

    // create a range of 5 dates, surrounding targetDate:
    var dates = [];
    for(var i = dateRangeOffset; i < dateRangeOffset + 5; i++) {
      dates.push(moment(targetDate).add(i, 'day').format('YYYY-MM-DD'));
    }

    // indicate busy status to user:
    var body = document.getElementById("root");
    startSearchAnimation();
    body.style.cursor="progress";

    getFlights(from, to, dates, function(flights) {
      if(flights) {
        var sortMode = $("input[name='sort-mode']:checked").val();
        var descending = !!document.getElementById('descending').checked;
        var flightsSorted = sortFlights(flights, sortMode, descending);
        showFlights(flightsSorted, dates, 1-dateRangeOffset);
      }
      body.style.cursor="default";
      stopSearchAnimation();
    });
  }

  // sends flight-search query to server
  // from, to = airports
  // dates = array of dates
  // callback = function to call on completion
  // return value: array of flights

  function getFlights(from, to, dates, callback) {
    // retrieve list of airlines first, then search for flights:
    getJSON('/airlines', function(airlines) {

      if(airlines) {

        // make a comma-separated string of airline codes:
        var airlineStr = airlines.map(function(airline) {
          return airline.code;
        }).join();

        // perform the flight search:
        var flightQuery =  'airline=' +airlineStr +'&date=' + dates.join() + '&from=' + from + '&to=' + to;
        getJSON('/flight_search?' + flightQuery, function(flights) {
          if(flights) {
            sessionStorage.setItem('lastFrom', JSON.stringify(from));
            sessionStorage.setItem('lastTo', JSON.stringify(to));
            sessionStorage.setItem('lastDates', JSON.stringify(dates));
            sessionStorage.setItem('lastQuery', JSON.stringify(flightQuery));
            sessionStorage.setItem('lastResult', JSON.stringify(flights));
            sessionStorage.setItem('lastResultTime', JSON.stringify(new Date()));
            sessionStorage.setItem('lastResultDirty', JSON.stringify(false));
          } 
          callback(flights);
        });
      }
    });
  }

  function sortFlights(flights, criterion, descending) {
    switch(criterion) {
    
      case 'airline':
        return flights.sort(function(a, b) {
          return descending ? 
            b.airline.name.localeCompare(a.airline.name) : 
            a.airline.name.localeCompare(b.airline.name);
        });
      case 'departure-time':
        return flights.sort(function(a, b) {
          return descending ? 
            new Date(b.start.dateTime) - new Date(a.start.dateTime) : 
            new Date(a.start.dateTime) - new Date(b.start.dateTime);
        
        });
      case 'duration':
        return flights.sort(function(a, b) {
          return descending ? b.durationMin - a.durationMin : a.durationMin - b.durationMin;
        });
      case 'price':
        return flights.sort(function(a, b) {
          return descending ? b.price - a.price : a.price - b.price;
        });
      default:
        return flights.sort(function(a, b) {
          return 0; // no sort
        });
    }
  }

  // Utility functions ////

  // formats airline name, start -> finish, flight numbers as html:
  function formatAirlineFlightDetails (flight) {
    var airlineName = flight.airline.name;
    var flightNum = flight.flightNum;
    var start = flight.start.airportCode;
    var finish = flight.finish.airportCode;
    return '<p><strong>' + airlineName + '</strong></p>' +
      '<p>&emsp;' + start + ' &#x2708; ' + finish + '</p>' +
      '<p>&emsp;flight ' + flightNum + '</p>';
  }

  // separates date and time, and formats as html:
  function formatDateForResults(isoDate) {
    var timeStr = moment(isoDate).format('hh:mm A');
    var dateStr = moment(isoDate).format('  ddd, DD MMM');
    var timezoneStr = 'timezone: UTC ' + moment(isoDate).format('Z');
    var htmlDate = '<p><strong>' + timeStr + '</strong>' + dateStr + '</p>' + '<p>' + timezoneStr + '</p>';
    return htmlDate; 
  }

  // converts minutes into hours and minutes, and formats as html:
  function formatMinsToHrsMins(minutes) {
    var hrs = Math.floor(minutes/60);
    var mins = minutes % 60;
    return ('<p>' + hrs + ' hours, ' + mins + ' minutes' + '</p>');
  }

  // generic AJAX request to return a javascript object, given a path relative to serverAddress:
  function getJSON(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(serverAddress + path));
    xhr.onload = function() {
      callback(xhr.status === 200 ? JSON.parse(xhr.responseText) : null);
    };
    xhr.send();
  }

})();