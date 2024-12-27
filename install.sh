#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

echo "Starting installation of Camera Access Tool requirements..."

# Check if Node.js is installed
if ! command_exists node; then
    echo "Node.js is not installed. Installing Node.js..."
    sudo apt update
    sudo apt install -y nodejs
else
    echo "Node.js is already installed."
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "npm is not installed. Installing npm..."
    sudo apt install -y npm
else
    echo "npm is already installed."
fi

# Check if cloudflared is installed
if ! command_exists cloudflared; then
    echo "cloudflared is not installed. Installing cloudflared..."
    wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
else
    echo "cloudflared is already installed."
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Start the application
echo "Starting the Camera Access Tool..."
npm start
