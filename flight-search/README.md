#Flight Search
---

##Introduction

**flight-search** is a front-end for the locomote Code-Task assignment.

It allows the user to select an origin and destination for a one-way flight, and a desired travel date.

##Live Demo
[http://52.62.255.103:9999](http://52.62.255.103:9999 "Live Demo")

##Description


Upon typing two or more characters into the origin or destination input fields, the app will initiate an AJAX request to the server to populate the drop-down choices for cities and airports. Valid choices must always include a 3-letter international airport code in parentheses.

The user must select a date for the search, which cannot be in the past.

Upon pressing the Search button, a search request to the server is initiated, and the results are displayed showing details for a range of 5 days surrounding the user's requested date, to facilitate the user picking the cheapest or most convenient flight according to their needs.

Each of the five days may be selected via tabs. 

Normally, the 5 days cover the range target-date +/-2 days. 
However, if the target date is *today* or *tomorrow* the range will be adjusted so that none of the days are in the past. 

eg **today, today+1, ..., today+4**  or **tomorrow, today, today+1, today+2, today+3**

Once the results are displayed, the user can select their desired flight, which takes them to confirmation page for a mock approval process.

Bootstrap is used to make the page responsive and to provide validation feedback (red / green borders) for the input fields

##Coding and methodology

The app is written in plain javascript and doesn't require a transpile / build phase

libraries used:

* **Moment.js** (pretty-much essential for correct handling of dates and times) - via CDN
* **jQuery 1.9** - via CDN
* **jQueryUI custom build** (only includes 'autocomplete; and 'datepicker') - files included in distribution
* **Bootstrap 3.3.7** - via CDN

The main issues encountered in developing this front-end app have centered around the availability of the html5 elements **datalist** and **input type="date"** on various browsers. Although part of the html5 standard, these features are still missing on several browsers. In order to address this sorry state of affairs, the jQueryUI components "autocomplete" and "datepicker" were employed. A large amount of time was devoted to cross-browser-testing.

For details on the results of testing across various browsers, please refer to the pdf document [Browser-Notes-Observations.pdf](./Browser-Notes-Observations.pdf "Browser-Notes-Observations.pdf") included in this package.

##Serving flight-search
for development purposes, flight search can be launched directly from the local computer's filesystem by opening **index.html** in the browser. However, this is not recommended. Testing should be done from an actual http server.

Of course, any web server can be used. For example, using the node server '[http-server](https://www.npmjs.com/package/http-server)':

**npm install http-server -g**

**cd flight-search && http-server -p 9000**

would serve flight-search on port 9000


##Additional considerations and to-do's

* Flight search is only one-way. It would be desirable to have it accomodate return flights
* formatting for results on small screens (phones) still needs some tweaking
* Scripted testing using Selenium or Phantom.js should be implemented
* There are still a couple of issues in safari, as noted in the pdf referenced above
* A callout showing the cheapest flight might be helpful to the user









