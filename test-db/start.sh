#!/bin/sh

# Run the MySQL container, with a database named 'atlan' and credentials
# for a user which can access it.
echo "Starting DB..."
docker run --name db -d \
  -e MYSQL_ROOT_PASSWORD=123 \
  -e MYSQL_DATABASE=atlan -e MYSQL_USER=kaushik -e MYSQL_PASSWORD=123 \
  -p 3308:3306 \
  mysql:5.7

# Wait for the database service to start up.
echo "Waiting for DB to start up..."
docker exec db mysqladmin --silent --wait=30 -ukaushik -p123 ping || exit 1

# Run the setup script.
echo "Setting up initial data..."
docker exec -i db mysql -ukaushik -p123 atlan < setup.sql