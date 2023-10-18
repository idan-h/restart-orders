#!/bin/sh

# Ask the user for the function name
echo "Enter the function name:"
read func_name

destination="$(dirname "$0")/$func_name"

# Check if the directory exists
if [ ! -d "$destination" ]; then
    # Directory doesn't exist, so copy the folder
    cp -R ../.example_func "$destination"
    
    # Replace a string inside a file in the copied folder
    # Detect the system and use the appropriate sed command
    if sed --version 2>&1 | grep -q GNU; then
        # For GNU sed (typically on Linux)
        sed -i "s/FUNC_NAME_XX/$func_name/g" "$destination/func.yaml"
    else
        # For BSD sed (like on macOS)
        sed -i '' "s/FUNC_NAME_XX/$func_name/g" "$destination/func.yaml"
    fi
else
    echo "Directory $destination already exists. Function wasn't created."
fi

