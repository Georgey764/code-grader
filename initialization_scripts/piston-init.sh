#!/bin/sh

if [ -z "$(ls -A /piston/packages)" ]; then
   echo "📦 No languages found. Installing defaults..."

   node /piston_api/src/index.js ppman install python
else
   echo "✅ Languages already present. Skipping download."
fi

# Start the API using the src path
echo "🚀 Starting Piston API..."
node /piston/src/index.js