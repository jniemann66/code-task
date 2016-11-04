#!/bin/bash

echo "Installing npm dependencies ..."
npm install

echo "Testing server ..."
npm test

echo "starting server ..."
npm start