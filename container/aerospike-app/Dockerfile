# Use the official Node.js image
FROM node:20.11-alpine

# Install required dependencies for Aerospike client
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    linux-headers

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY source/aerospike-app/package*.json source/aerospike-app/*.lock ./
RUN yarn install

# Copy the app source code
COPY source/aerospike-app .

# Compile TypeScript code
RUN yarn build

# Command to run the app
CMD ["yarn", "start"]