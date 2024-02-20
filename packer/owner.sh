#!/bin/bash
# Change ownership of the web application directory to csye6225 user and group
sudo chown -R csye6225:csye6225 /opt/webapp
# Set permissions for the web application directory
sudo chmod -R 750  /opt/webapp
# Copy the bootup service file to the systemd directory
sudo cp /tmp/star.service /lib/systemd/system/

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable star
sudo systemctl start star
sudo systemctl status star