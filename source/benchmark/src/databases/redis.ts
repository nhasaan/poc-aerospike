import { createClient } from 'redis';
import { config } from '../config';
import { BenchmarkResult } from '../types';

export class RedisBenchmark {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port
      }
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async runSetBenchmark(): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const value = 'x'.repeat(config.benchmark.valueSize);

    for (let i = 0; i < config.benchmark.iterations; i++) {
      await this.client.set(`key:${i}`, value);
    }

    const totalTime = Date.now() - startTime;

    return {
      operation: 'set',
      database: 'Redis',
      operationsPerSecond: (config.benchmark.iterations / totalTime) * 1000,
      averageLatency: totalTime / config.benchmark.iterations,
      totalTime
    };
  }

  async runGetBenchmark(): Promise<BenchmarkResult> {
    const startTime = Date.now();

    for (let i = 0; i < config.benchmark.iterations; i++) {
      await this.client.get(`key:${i}`);
    }

    const totalTime = Date.now() - startTime;

    return {
      operation: 'get',
      database: 'Redis',
      operationsPerSecond: (config.benchmark.iterations / totalTime) * 1000,
      averageLatency: totalTime / config.benchmark.iterations,
      totalTime
    };
  }

  async runBatchGetBenchmark(): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const batches = Math.ceil(config.benchmark.iterations / config.benchmark.batchSize);

    for (let i = 0; i < batches; i++) {
      const keys = Array.from({ length: config.benchmark.batchSize }, 
        (_, j) => `key:${i * config.benchmark.batchSize + j}`);
      await this.client.mGet(keys);
    }

    const totalTime = Date.now() - startTime;

    return {
      operation: 'batch_get',
      database: 'Redis',
      operationsPerSecond: (config.benchmark.iterations / totalTime) * 1000,
      averageLatency: totalTime / config.benchmark.iterations,
      totalTime
    };
  }
}
