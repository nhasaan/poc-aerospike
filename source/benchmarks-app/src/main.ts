import { Benchmark } from './utils/benchmark';
import Aerospike from 'aerospike';
import dotenv from 'dotenv';
import redisConnection from './connections/redis-connection';
import AerospikeConnection from './connections/aerospike-connection';

dotenv.config();

class BenchmarkPerformanceTest {
  private redis: typeof redisConnection;
  private aerospikeClient: Aerospike.Client;
  private benchmark: Benchmark;
  
  constructor(redis: typeof redisConnection, aerospikeClient: Aerospike.Client) {
    this.redis = redis;
    this.aerospikeClient = aerospikeClient;
    this.benchmark = new Benchmark();
  }

  // Generate test data with proper type safety
  private generateTestData(size: number): Array<{ key: string; value: string }> {
    return Array.from({ length: size }, (_, i) => ({
      key: `key-${i}`,
      value: `value-${i}-${'x'.repeat(Math.floor(Math.random() * 1000))}`,
    }));
  }

  // Single write test with error handling
  async testSingleWrites(dataSize: number) {
    try {
      const testData = this.generateTestData(dataSize);
      
      console.log('Testing Redis single writes...');
      const redisSingleWrite = await this.benchmark.measure(async () => {
        await Promise.all(testData.map(item => 
          this.redis.set(item.key, item.value)
        ));
      });

      console.log('Testing Aerospike single writes...');
      const aerospikeSingleWrite = await this.benchmark.measure(async () => {
        await Promise.all(testData.map(item => {
          const key = new Aerospike.Key('test', 'demo', item.key);
          return this.aerospikeClient.put(key, { value: item.value });
        }));
      });

      return { redisSingleWrite, aerospikeSingleWrite };
    } catch (error) {
      console.error('Error in single writes test:', error);
      throw error;
    }
  }

  // Batch write test with proper typing and error handling
  async testBatchWrites(dataSize: number, batchSize: number) {
    try {
      const testData = this.generateTestData(dataSize);
      const batches = Array.from({ length: Math.ceil(testData.length / batchSize) }, (_, i) =>
        testData.slice(i * batchSize, (i + 1) * batchSize)
      );

      console.log('Testing Redis batch writes...');
      const redisBatchWrite = await this.benchmark.measure(async () => {
        await Promise.all(batches.map(async batch => {
          const pipeline = this.redis.pipeline();
          batch.forEach(item => pipeline.set(item.key, item.value));
          return pipeline.exec();
        }));
      });

      console.log('Testing Aerospike batch writes...');
      const aerospikeBatchWrite = await this.benchmark.measure(async () => {
        await Promise.all(batches.map(async batch => {
          return Promise.all(batch.map(item => {
            const key = new Aerospike.Key('test', 'demo', item.key);
            return this.aerospikeClient.put(key, { value: item.value });
          }));
        }));
      });

      return { redisBatchWrite, aerospikeBatchWrite };
    } catch (error) {
      console.error('Error in batch writes test:', error);
      throw error;
    }
  }

  // Read performance test with proper error handling
  async testReads(dataSize: number) {
    try {
      const testData = this.generateTestData(dataSize);
      
      // Write test data first
      await this.testBatchWrites(dataSize, 1000);

      console.log('Testing Redis random reads...');
      const redisReads = await this.benchmark.measure(async () => {
        await Promise.all(testData.map(item => 
          this.redis.get(item.key)
        ));
      });

      console.log('Testing Aerospike random reads...');
      const aerospikeReads = await this.benchmark.measure(async () => {
        await Promise.all(testData.map(item => {
          const key = new Aerospike.Key('test', 'demo', item.key);
          return this.aerospikeClient.get(key);
        }));
      });

      return { redisReads, aerospikeReads };
    } catch (error) {
      console.error('Error in reads test:', error);
      throw error;
    }
  }

  // Memory usage test with better error handling and typing
  async testMemoryUsage(dataSize: number) {
    try {
      await this.redis.flushall();
      const redisInitialMemory = await this.redis.info('memory');
      await this.testBatchWrites(dataSize, 1000);
      const redisFinalMemory = await this.redis.info('memory');

      return {
        redisMemoryDelta: this.parseRedisMemory(redisFinalMemory) - this.parseRedisMemory(redisInitialMemory),
      };
    } catch (error) {
      console.error('Error in memory usage test:', error);
      throw error;
    }
  }

  private parseRedisMemory(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    if (!match) {
      throw new Error('Failed to parse Redis memory info');
    }
    return parseInt(match[1], 10);
  }

  async runFullTest() {
    const TEST_SIZES = [1000, 10000, 100000];
    const BATCH_SIZES = [100, 1000];
    
    const results = {
      singleWrites: {} as Record<number, any>,
      batchWrites: {} as Record<string, any>,
      reads: {} as Record<number, any>,
      memory: {} as Record<number, any>
    };

    try {
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
    } catch (error) {
      console.error('Error in full test execution:', error);
      throw error;
    }
  }
}

// Application entry point with proper cleanup
async function main() {
  let aerospikeClient: Aerospike.Client | null = null;
  
  try {
    console.log('Starting database performance tests...');
    
    aerospikeClient = await AerospikeConnection.getInstance();
    const performanceTest = new BenchmarkPerformanceTest(redisConnection, aerospikeClient);
    const results = await performanceTest.runFullTest();
    
    console.log('\nTest Results:');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exitCode = 1;
  } finally {
    if (aerospikeClient) {
      await aerospikeClient.close();
    }
  }
}

// Handle process termination with proper async cleanup
async function cleanup() {
  console.log('Closing connections...');
  try {
    const client = await AerospikeConnection.getInstance();
    if (client) {
      await client.close();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  process.exit(0);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Start the application
main();