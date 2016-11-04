#!/bin/bash

# this script starts the back-end server
# It also does a test beforehand ...

echo "Installing npm dependencies ..."
npm install

echo "Testing server ..."
npm test

echo "starting server ..."
npm start