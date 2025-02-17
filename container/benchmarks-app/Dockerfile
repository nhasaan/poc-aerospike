# Define base image and args
ARG REGISTRY_BASE_IMAGE=node:20.18.3-alpine
FROM ${REGISTRY_BASE_IMAGE}

# Define all args
ARG SOURCE_DIR=../../source/benchmarks-app
ARG COMMON_WORK_DIR=/app
ARG WORK_DIR=${COMMON_WORK_DIR}/source

# Set environment variables
ENV SOURCE_DIR=${SOURCE_DIR} \
    COMMON_WORK_DIR=${COMMON_WORK_DIR} \
    WORK_DIR=${WORK_DIR}

# Install required dependencies for Aerospike client
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    linux-headers

# Create app directory
WORKDIR ${WORK_DIR}

# Install app dependencies
COPY ${SOURCE_DIR}/package*.json ${SOURCE_DIR}/*.lock ${WORK_DIR}
RUN yarn install --frozen-lockfile

# Copy the app source code
COPY ${SOURCE_DIR} ${WORK_DIR}

# Compile TypeScript code
RUN yarn build

# Command to run the app
# CMD ["yarn", "start"]