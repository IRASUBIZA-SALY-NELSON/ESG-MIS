#!/bin/bash

# Specify the content to be written to the .env.local file
ENV_CONTENT="# PROD\nNEXT_PUBLIC_API_URL=http://5.252.53.111:6543/api/v1\nNEXT_PUBLIC_BASE_API_URL=http://5.252.53.111:6543"

# Check if .env.local file exists
if [ -f .env.local ]; then
    # If the file exists, override its contents
    echo -e "$ENV_CONTENT" > .env.local
    echo "Existing .env.local file updated."
else
    # If the file doesn't exist, create it and write the content
    echo -e "$ENV_CONTENT" > .env.local
    echo ".env.local file created."
fi
