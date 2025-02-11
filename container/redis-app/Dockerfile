# Use the official Node.js image
FROM node:20.11-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY source/redis-app/package*.json source/redis-app/*.lock ./
RUN yarn install

# Copy the app source code
COPY source/redis-app .

# Compile TypeScript code
RUN yarn build

# Command to run the app
# CMD ["yarn", "start"]