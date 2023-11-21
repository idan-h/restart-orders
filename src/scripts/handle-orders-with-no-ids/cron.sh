#!/bin/bash

source ~/.bashrc

# Variables
SCRIPT_PATH="$(dirname "$(readlink -f "$0")")"
VENV_PATH="$SCRIPT_PATH/venv"
LOCK_FILE="$SCRIPT_PATH/cron.lock"

# Check for lock file and exit if found
if [ -e $LOCK_FILE ]; then
    echo "Process still running, exiting"
    exit 0
fi

# Create lock file
touch $LOCK_FILE

# Activate the virtual environment
source $VENV_PATH/bin/activate

# Update the repository
cd $SCRIPT_PATH && git reset --hard && git pull

# Ensure the cron script is executable
chmod +x $SCRIPT_PATH/cron.sh

# Install/update dependencies
pip install -r $SCRIPT_PATH/requirements.txt

# Run your script
python $SCRIPT_PATH/script.py

# Remove lock file
rm $LOCK_FILE
