POC on Aerospike vs Redis Performance

This project is a proof-of-concept (POC) to compare the performance of Aerospike and Redis for caching and database operations.

Prerequisites

Install Docker and Docker Compose

Getting Started

Navigate to the root of the project:

cd /path/to/project/root

Start the containers:

docker compose -f ./container/compose.yml up --build

This command will build and start the following services:

Services

Redis: Runs a Redis instance on port 6381 (mapped from 6379 inside the container).

Redis App: A Node.js application that connects to the Redis instance.

Aerospike: Runs an Aerospike instance on ports 3004, 3001, 3002, and 3003.

Aerospike App: A Node.js application that connects to the Aerospike instance.

Configuration

Redis

Host: redis

Port: 6381

Aerospike

Host: aerospike

Port: 3004

Volume Mapping

The source code for each application is mapped to /usr/src/app inside the container:

../source/redis-app:/usr/src/app

../source/aerospike-app:/usr/src/app

Resource Allocation

Each application container has resource limits and reservations:

Limits:

CPU: 0.5

Memory: 250M

Reservations:

CPU: 0.25

Memory: 152M

Stopping the Containers

To stop and remove the running containers, use:

   docker compose -f ./container/compose.yml down

Notes

The extra_hosts entry allows access to host.docker.internal, enabling communication with the host machine.

The depends_on ensures that the database services (redis, aerospike) start before their respective applications.

License

This project is licensed under the MIT License.