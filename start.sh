#!/bin/bash

# start the back-end server
cd ./flight-server && ./start.sh && disown

# start front-end server (requires the npm component 'http-server' installed globally)
# (you could replace this with any suitable web-server of your choice)
cd ./flight-search && http-server -p 3000