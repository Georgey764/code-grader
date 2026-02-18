#!/bin/bash
# Start Piston in the background
# /piston-api &
# PISTON_PID=$!

# # Wait for the API to be ready
# sleep 3

# Install the languages you need for your grading system

piston_api node cli/index.js ppman install python=3.10.0
piston_api pkg install python=3.9.0
piston pkg install nodejs=18.15.0

# echo "Piston is ready for grading!"

# Bring the background process to the foreground so the container stays alive
# wait $PISTON_PID