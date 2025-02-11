// src/main.ts
import redisConnection from './connections/redis.connection';
import AerospikeConnection from './connections/aerospike.connection';
import { Benchmark } from './utils/benchmark';
import Aerospike from 'aerospike';
import dotenv from 'dotenv';

dotenv.config();

class DatabasePerformanceTest {
  private redis: typeof redisConnection;
  private aerospikeClient: Aerospike.Client;
  private benchmark: Benchmark;
  
  constructor(redis: typeof redisConnection, aerospikeClient: Aerospike.Client) {
    this.redis = redis;
    this.aerospikeClient = aerospikeClient;
    this.benchmark = new Benchmark();
  }

  // Generate test data
  private generateTestData(size: number): Array<{ key: string; value: string }> {
    const data = [];
    for (let i = 0; i < size; i++) {
      data.push({
        key: `key-${i}`,
        value: `value-${i}-${'x'.repeat(Math.floor(Math.random() * 1000))}`, // Random-sized values
      });
    }
    return data;
  }

  // Single write test
  async testSingleWrites(dataSize: number) {
    const testData = this.generateTestData(dataSize);
    
    // Redis single writes
    console.log('Testing Redis single writes...');
    const redisSingleWrite = await this.benchmark.measure(async () => {
      for (const item of testData) {
        await this.redis.set(item.key, item.value);
      }
    });

    // Aerospike single writes
    console.log('Testing Aerospike single writes...');
    const aerospikeSingleWrite = await this.benchmark.measure(async () => {
      for (const item of testData) {
        const key = new Aerospike.Key('test', 'demo', item.key);
        await this.aerospikeClient.put(key, { value: item.value });
      }
    });

    return { redisSingleWrite, aerospikeSingleWrite };
  }

  // Batch write test
  async testBatchWrites(dataSize: number, batchSize: number) {
    const testData = this.generateTestData(dataSize);
    const batches = [];
    
    for (let i = 0; i < testData.length; i += batchSize) {
      batches.push(testData.slice(i, i + batchSize));
    }

    // Redis pipeline writes
    console.log('Testing Redis batch writes...');
    const redisBatchWrite = await this.benchmark.measure(async () => {
      for (const batch of batches) {
        const pipeline = this.redis.pipeline();
        for (const item of batch) {
          pipeline.set(item.key, item.value);
        }
        await pipeline.exec();
      }
    });

    // Aerospike batch writes
    console.log('Testing Aerospike batch writes...');
    const aerospikeBatchWrite = await this.benchmark.measure(async () => {
      for (const batch of batches) {
        const operations = batch.map(item => ({
          key: new Aerospike.Key('test', 'demo', item.key),
          bins: { value: item.value }
        }));
        await this.aerospikeClient.put(operations);
      }
    });

    return { redisBatchWrite, aerospikeBatchWrite };
  }

  // Read performance test
  async testReads(dataSize: number) {
    const testData = this.generateTestData(dataSize);
    
    // First, write the test data
    await this.testBatchWrites(dataSize, 1000);

    // Redis random reads
    console.log('Testing Redis random reads...');
    const redisReads = await this.benchmark.measure(async () => {
      for (const item of testData) {
        await this.redis.get(item.key);
      }
    });

    // Aerospike random reads
    console.log('Testing Aerospike random reads...');
    const aerospikeReads = await this.benchmark.measure(async () => {
      for (const item of testData) {
        const key = new Aerospike.Key('test', 'demo', item.key);
        await this.aerospikeClient.get(key);
      }
    });

    return { redisReads, aerospikeReads };
  }

  // Memory usage test
  async testMemoryUsage(dataSize: number) {
    const testData = this.generateTestData(dataSize);
    
    // Redis memory usage
    await this.redis.flushall();
    const redisInitialMemory = await this.redis.info('memory');
    await this.testBatchWrites(dataSize, 1000);
    const redisFinalMemory = await this.redis.info('memory');

    return {
      redisMemoryDelta: this.parseRedisMemory(redisFinalMemory) - this.parseRedisMemory(redisInitialMemory),
    };
  }

  private parseRedisMemory(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async runFullTest() {
    const TEST_SIZES = [1000, 10000, 100000];
    const BATCH_SIZES = [100, 1000];
    
    const results = {
      singleWrites: {},
      batchWrites: {},
      reads: {},
      memory: {}
    };

    for (const size of TEST_SIZES) {
      console.log(`\nRunning tests for ${size} items:`);
      
      results.singleWrites[size] = await this.testSingleWrites(size);
      
      for (const batchSize of BATCH_SIZES) {
        results.batchWrites[`${size}_${batchSize}`] = 
          await this.testBatchWrites(size, batchSize);
      }
      
      results.reads[size] = await this.testReads(size);
      results.memory[size] = await this.testMemoryUsage(size);
    }

    return results;
  }
}

// Application entry point
async function main() {
  try {
    console.log('Starting database performance tests...');
    
    // Initialize Aerospike connection
    const aerospikeClient = await AerospikeConnection.getInstance();
    
    // Create performance test instance
    const performanceTest = new DatabasePerformanceTest(redisConnection, aerospikeClient);
    
    // Run the full test suite
    const results = await performanceTest.runFullTest();
    
    // Log results
    console.log('\nTest Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Cleanup
    await AerospikeConnection.close();
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error);
    await AerospikeConnection.close();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing connections...');
  await AerospikeConnection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Closing connections...');
  await AerospikeConnection.close();
  process.exit(0);
});

// Start the application
main();