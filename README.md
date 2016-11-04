# Locomote code task

This project is divided into two components

1. a **back-end server** written in Node/Express running on **port 9000**
2. a **front-end server** running on port **3000**

## Prerequisites

* **Node.js** v4 or higher needs to be installed on the target platform
* **npm** needs to be installed on the target platform
Please visit [https://nodejs.org/](https://nodejs.org) for details on how to install Node on particular platforms
* **mocha** (used for testing) needs to be installed globally
* npm package **http-server** (used for serving the front-end) needs to be installed globally

these packages usually need to be installed with admin permission. For example, on ubuntu:

    sudo apt-get install nodejs
    sudo apt-get install npm
    sudo npm install mocha -g
	sudo npm install http-server -g 
    
(UBUNTU ONLY) node is called 'nodejs' on ubuntu - so, create a symlink:

    sudo ln -s /usr/bin/nodejs /usr/bin/node

## Starting the server

Once **Node, npm, mocha,** and **http-server** have been installed,

start.sh and flight-server/start.sh need to have execute permissions:

	chmod +x start.sh
    chmod +x flight-server/start.sh

then just run start.sh from the root of this project eg:
    
    ./start.sh

## testing the app in a browser

Once both the front-end server and back-end server are running,
enter the address of the front-end server in your browser:

**http://localhost:3000**

and do a basic flight search:

From: syd
To: new (york)
Date: (some date in the future)

## Additional information on the project components

More detailed information on the individual components (back-end server and front-end server) can be found in the README.md files of their respective subfolders:

flight-search:
[./flight-search/README.md](./flight-search/README.md)

flight-server:
[./flight-server/README.md](./flight-server/README.md)



