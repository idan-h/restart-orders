#!/bin/bash

# Get the full path of the directory where setup.sh resides
SCRIPT_PATH="$(dirname "$(readlink -f "$0")")"
echo $SCRIPT_PATH

# Path to the virtual environment and the cron script
VENV_PATH="$SCRIPT_PATH/venv"
CRON_SCRIPT="$SCRIPT_PATH/cron.sh"

# Cron schedule (e.g., every 1 day)
CRON_SCHEDULE="0 0 * * *"

# Create the virtual environment if it doesn't exist
if [ ! -d "$VENV_PATH" ]; then
    python3 -m venv $VENV_PATH
fi

# Ensure the cron script is executable
chmod +x $CRON_SCRIPT

# Set up the cron job
# This command will append the new job to the crontab, preserving existing jobs
if ! (crontab -l 2>/dev/null | grep -q "$CRON_SCRIPT"); then
    (crontab -l 2>/dev/null; echo "MONDAY_API_KEY=$MONDAY_API_KEY"; echo "$CRON_SCHEDULE $CRON_SCRIPT") | crontab -
fi
