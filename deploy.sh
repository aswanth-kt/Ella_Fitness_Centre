#!/bin/bash

# Stop immediately if any command fails
set -e

echo "========================================"
echo "Starting deployment..."
echo "========================================"

PROJECT_DIR="/home/ubuntu/Ella_Fitness_Centre"

echo "Moving to project..."
cd "$PROJECT_DIR"

echo "Updating repository..."
git fetch origin
git reset --hard origin/main

echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Deploying frontend..."
sudo rm -rf /var/www/myapp/*
sudo cp -r dist/* /var/www/myapp/

echo "Restarting backend..."
cd ../backend
pm2 restart backend

echo "Reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "========================================"
echo "Deployment completed successfully!"
echo "========================================"