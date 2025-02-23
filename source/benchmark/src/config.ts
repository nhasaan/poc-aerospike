import 'dotenv/config';

export const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  aerospike: {
    hosts: [{
      addr: process.env.AEROSPIKE_HOST || 'localhost',
      port: parseInt(process.env.AEROSPIKE_PORT || '3000')
    }],
    namespace: 'test',
    set: 'benchmark'
  },
  benchmark: {
    iterations: 10000,
    batchSize: 1000,
    valueSize: 1000
  }
};
