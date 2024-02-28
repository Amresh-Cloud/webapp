#!/bin/bash

# This script sets up the environment for running a web application.
echo "Running Dependencies file"
sudo dnf update -y

echo "Installing unzip"
sudo dnf install -y unzip

# Install MySQL server


# Start the MySQL service

# Install Node.js
echo "Installing Node.js"
sudo dnf module enable -y nodejs:16
sudo dnf install -y npm

echo "Creating a group for the application"
sudo groupadd csye6225

# Create a user for the application without login shell
echo "Creating a user for the application"
sudo useradd -M -g csye6225 -s /usr/sbin/nologin csye6225

# Copy the web application archive to the appropriate directory
echo "Copying the web application archive"
sudo cp /tmp/webapp.zip /opt/webapp.zip

echo "Extracting the web application archive"
cd /opt || exit
sudo mkdir webapp
sudo unzip webapp.zip -d webapp
ls -l
# go in the webapp
cd webapp/ || exit

ls -l

# Navigate to the web application directory
# cd webapp/ || exit

# ls -l

echo "Installing the npm dependencies for the web application"
sudo npm install

echo "Running npm install"

# Start the MySQL service to verify its status
echo "Verifying the status of MySQL service"
sudo systemctl status mysqld

# Check if MySQL is enabled to start on boot
sudo systemctl start mysqld

sudo systemctl status mysqld