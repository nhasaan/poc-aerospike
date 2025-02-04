# Use the official Node.js image
FROM node:20.11-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY source/aerospike-app/package*.json ./
RUN npm install

# Copy the app source code
COPY source/aerospike-app .

# Compile TypeScript code
RUN npx tsc

# Command to run the app
# CMD ["node", "dist/main.js"]