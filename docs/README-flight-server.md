#Flight server

##Introduction

This express server accepts http requests from browsers on port 3000, and subsequently makes http requests to the Locomote code-task API on behalf of the user.

The server has two functions:

1. serve pages to the user
2. respond to AJAX queries from the user's browser

It performs flight searches based on requests containing a combination of airlines and dates. In order to achieve this, it asynchronously sends multiple single-flight-search requests to the Locomote code-task API, and returns the combined results.

(Consolidating single flight searches into a "bulk" search is necessary because most browsers can only handle around 6 concurrent http connections to the same host. If the browser was to make these individual requests directly, With 6 airlines and 5 days, this would have amounted to 30 ajax requests from the browser each time the user clicked "search", which would not be acceptable).

##Test Methodology

The server component was developed using a strict TDD methodology. No new functionality was added without first having an existing test written. Testing is done using Mocha and Chai.
The test suite can be run at any time using the **npm test** command

##installation

###Prerequisites: 

* **Node.js v4** or higher needs to be installed on the target platform
* **npm** needs to be installed on the target platform
Please visit [https://nodejs.org/](https://nodejs.org) for details on how to install Node on particular platforms

* **mocha** (used for testing) needs to be installed *globally*

these packages usually need to be installed with admin permission. For example, on ubuntu:

    sudo apt-get install nodejs
    sudo apt-get install npm
    sudo npm install mocha -g
    
also, node is called 'nodejs' on ubuntu - create a symlink:

    sudo ln -s /usr/bin/nodejs /usr/bin/node
    
Once Node has been installed,

flight-server/start.sh needs to have execute permissions:

    chmod +x flight-server/start.sh

then just run start.sh, eg:
    
    cd flight-server && ./start.sh

##npm commands

**npm install** - install dependencies

**npm test** - run test suite

**npm start** - start server


##dependencies

path

express

morgan

##dev dependencies

chai

mocha

superagent

moment

##Node versions tested during development

**v4.2.6,**

**v4.4.7,**

**v4.4.5**

##API description

**http://server-address:3000/**

sends the application homepage (**index.html**) to the user

**http://server-address:3000/airports?q=xxx**

does an airport search in a similar fashion to the Locomote code-task API. 
However, the information returned is a subset of the information provided by the Locomote API

Returns an array of objects containing the following fields:

airportCode,
airportName,
cityName,
countryName,
stateCode

**http://server-address:3000/airlines**

identical to the Locomote API version. Returns an array of airline objects containing the fields: code, name

**http://server-address:3000/flight_search?airline=a,b,c&date=x,y,z&from=sss&to=ddd**

* does a flight query which accepts a combination of **multiple airline codes (a,b,c, ...)** and **multiple dates (x,y,z ...)**

* Submits multiple flight search requests to the Locomote API on behalf of the requestor, and consolidates the results.

dates are expected to be in the format YYYY-MM-DD

*Note: I spent some time trying to decide what the correct syntax for this should be. The 
Locomote API syntax has a single airline as a URL parameter, followed by from, to, and date represented as query parameters. Normally, the path component identifies a resource, and the query parameters are for retrieval of non-heirarchical data. With multiple airlines, it wasn't entirely clear how to get a semantic fit to this model. In the end, I settled on making the multiple airlines a query parameter for my API*

##Additional Considerations and To-do's:

* need to refine logging ([Winston](https://github.com/winstonjs/winston) / [Morgan](https://github.com/expressjs/morgan) etc)
* In production environments, needs a process manager, such as [pm2](http://pm2.keymetrics.io/)
* Consider adding a build process (webpack) with minification etc
* use behind reverse proxy ? (Nginx)
* consider streaming results back to browser, to improve user experience
* consider deploying with docker




