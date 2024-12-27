#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Please install npm and try again."
    exit 1
fi

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null
then
    echo "cloudflared is not installed. Installing cloudflared..."
    wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
fi

# Install Node.js dependencies
npm install

# Start the application
node app.js
