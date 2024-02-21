#!/bin/bash

# This script sets up the environment for running a web application.
echo "Running Dependencies file"
sudo dnf update -y

echo "Installing unzip"
sudo dnf install -y unzip

# Install MySQL server
echo "Installing MySQL"
sudo dnf install -y mysql-server

# Start the MySQL service
echo "Starting mysql"
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Change the password for the root user in MySQL
echo "Changing the password in mysql"
sudo mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Amresh@2024'; FLUSH PRIVILEGES;"

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
sudo touch .env
sudo sh -c 'echo "DBHOST=localhost" >> .env'
sudo sh -c 'echo "DBUSER=root" >> .env'
sudo sh -c 'echo "DBPASSWORD=Amresh@2024" >> .env'
sudo sh -c 'echo "DBPORT=3306" >> .env'
sudo sh -c 'echo "DBNAME=sys" >> .env'

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