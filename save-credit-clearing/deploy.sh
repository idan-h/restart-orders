#!/bin/sh

# Run the copy.sh script
./copy.sh

# Check if copy.sh executed successfully
if [ $? -eq 0 ]; then
    # Run the fn command
    fn -v deploy --app restart-2
else
    echo "Error occurred in copy.sh"
    exit 1
fi


