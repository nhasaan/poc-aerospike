FROM node:18-bullseye-slim

WORKDIR /app

# Install build dependencies and required libraries for Aerospike client
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    libc6 \
    libc6-dev \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

COPY source/benchmark/package*.json ./
RUN npm install

COPY source/benchmark .
RUN npm run build

CMD ["npm", "start"]
