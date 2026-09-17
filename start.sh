#!/bin/sh

# Ensure volume data directory exists
mkdir -p /data/uploads

# If database doesn't exist in the volume, copy the initial one from the repository
if [ ! -f /data/database.sqlite ]; then
  echo "First run: Copying initial database to volume..."
  cp server/database.sqlite /data/database.sqlite 2>/dev/null || echo "No initial DB found, it will be created."
fi

# If uploads are empty in the volume, copy existing uploads
if [ ! "$(ls -A /data/uploads)" ]; then
  echo "First run: Copying initial uploads to volume..."
  cp -r public/uploads/* /data/uploads/ 2>/dev/null || echo "No initial uploads found."
fi

# Start the Node.js server
exec node server/index.js
