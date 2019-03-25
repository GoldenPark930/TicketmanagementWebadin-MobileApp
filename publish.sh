#!/bin/bash
git pull
gulp clean
npm install
NODE_ENV=production gulp publish

