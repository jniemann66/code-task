# Locomote code task

----------


## Description

This project is a coding assignment, in which the task is to build an airline flight-search application.
The app consists of two components:

1. A **Front-end application,** which has a user-friendly interface, and allows the user to search for flights, based on a specific origin, destination, and date.

2. A **Back-end server,** which performs two functions:
	1.  serves the html, javascript and css for the front-end application to the user
	2.  accepts and responds to AJAX queries from the user's browser


For the purposes of this exercise, the front-end application is not permitted to use web frameworks such as React or Angular, but it may use utility libraries such as lodash, jQuery, and moment.js

Note: the original brief for the project can be found [here](http://node.locomote.com/code-task/ "here")

The overall achitecture looks something like this:

![](architecture.PNG)
 

## Target environments

a) Front End

The **front-end** has been extensively tested on a number of browsers and platforms. 
A summary of the some of the results of testing on various browsers and OSes can be found in the following pdf:

[Browser-Notes-Observations.pdf](./docs/Browser-Notes-Observations.pdf)

An assortment of screenshots from these tests can also be found here: [docs/images/screenshots](docs/images/screenshots)

*(One of the biggest challenges with this project was dealing with the html5 date and datalist inputs which, at the time of writing, are still missing from various modern browsers. The solution was to polyfill using jQueryUI)*

b) Back-End

The **back-end-server** is expected to run on any platform capable of running **Node** and **npm** , including Mac, Linux, or Windows, with the latter two probably being more commonplace as server platforms. 

The back-end has been tested on **Kubuntu 16.04,** **Windows 10**, and **Macintosh OSX** - all Intel x64 versions.

Node Versions **v4.2.6,** **v4.4.5,** **v4.4.7** have been tested thus far, and further testing on other Node versions (both older and newer) is underway. 

It is not anticipated that the version of Node will be particularly critical, although the server does use some ES6 (ES2015) language features (such as const, let, arrow functions, and promises). at the time of writing (November 2016) it is recommended that version 4 or higher be used. (Node v4 also has LTS status until April 2018). 

## Prerequisites

* **Node.js** v4 or higher needs to be installed on the target platform
* **npm** needs to be installed on the target platform
Please visit [https://nodejs.org/](https://nodejs.org) for details on how to install Node (and npm) on particular platforms
* **mocha** (used for testing) needs to be installed globally

these packages usually need to be installed with admin permission. For example, on ubuntu:

    sudo apt-get install nodejs
    sudo apt-get install npm
    sudo npm install mocha -g
    
(UBUNTU ONLY) node is called 'nodejs' on Ubuntu - so, create a symlink:

    sudo ln -s /usr/bin/nodejs /usr/bin/node

## Starting the server

Once **Node, npm,** and **mocha** have been installed,

cd to the root directory of the project.

ensure that **start.sh** and **flight-server/start.sh** have execute permissions. For example:

	chmod +x start.sh
	chmod +x flight-server/start.sh

then just run start.sh from the root of this project eg:
    
    ./start.sh


*Note to Windows Users: to run bash scripts, the use of [Git Bash](https://git-for-windows.github.io/ "Git Bash") is recommended.* 

The end-user connects their browser to the front-end server on port 3000

The startup process for the back-end server incorporates a suite of tests before the service starts. All of the tests are expected to pass. Failure to pass all tests indicates a problem.

Additionally, the test suite can be run at any time from the **flight-server** directory, by running the command:

**npm test**

However, it will not work if there is an instance of the back-end server already running, as a conflict will arise from both instances trying to bind to port 3000


## testing the app in a browser

Once both the front-end server and back-end server are running,
enter the address of the front-end server in your browser:

**http://localhost:3000**

and do a basic flight search:

the cities shoould auto-complete when you type 2-3 characters ...

From: syd

To: new (york)

Date: (some date in the future)

## Application Design and Behaviour

The flight search needs to be intuitive, fast and easy to use. It should only require 3 input fields to be completed by the user in order to to give back a meaningful search result.

The input consists of an origin (aka 'from'), destination (aka 'to') and date field.

Once the user starts typing into either the 'from' or 'to' fields, the app will look for matches from the back-end server in order to provide suitable auto-complete options as drop-downs
 
The date needs to be unambiguous, and therefore a date-picker component is employed to ensure that the user can select valid dates with confidence and comfort.

Upon hitting the search button, a flight search typically takes around 6-7 seconds, and thus some reassurance needs to be provided to the user that the search is underway, and that results will soon be available. In order to achieve this, a "glowing button" effect is implemented on the search button, to indicate that it is active.

(Additional "loading" animations may also contribute to providing good feedback to the user, such as a flying jet or similar - this is something to be considered as a future additon to the interface.)

The search results are subsequently displayed in a table, and the user has the opportunity to sort the results in various ways for a period of 5 minutes, after which the results are considered to have expired, triggering another search query to be sent to the server using the current search criteria and sort options.

In addition to the date entered by the user, 4 additional dates are also shown in the results (+/- 2 days from the entered date). These can be viewed by selecting tabs.

![](flight-search/images/screenshots/OSX10.7-firefox48.PNG)
*above: flight-search running on Firefox v48 on Macintosh OSX 10.7*


Finally, the user can select a flight by clicking on the relevant "Select" button, which will take them to a confirmation screen. 

(Since Locomote provides a workflow for their corporate customers, the flight would be sent off to the user's manager for approval at this point, but the implementation of that behaviour is beyond the scope of this project) 

The end-user should expect to be able to use the app on a variety of different devices and browsers, so the interface needs to be responsive enough to provide a usable experience on any screen size.

(currently, the formatting of results for small screens is readable, but still needs tuning ... )


## Technologies used

* Back-end server: **node.js** and **Express**
* Back-end testing: **mocha** (testing framework) and **chai** (adds 'expect' module, among other things)
* Back-end logging: **morgan** - provides basic logging of incoming requests and their eventual results (logging is certainly one area that could be expanded in this project - separate logs for errors vs access, and log rotations could ve implemented)

* Front-end: **moment.js** - utility library for handling dates and times
* Front-end: **Bootstrap 3** - used to provide form field validation feedback (red/green) and responsive design
* Front-end: **jQuery** - used for selecting various DOM elements and a few event handlers
* Front-end: **jQueryUI** (custom build with only datepicker and autocomplete) - used to polyfill html5 date and datalist on broswers that don't have them
  
## Additional information on the project components

More detailed information on the individual components (back-end server and front-end app) can be found in the README.md files of their respective subfolders:

flight-server:
[README-flight-server](docs/flight-server/README.md)



