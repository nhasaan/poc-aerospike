import Aerospike from 'aerospike';
import { config } from '../config';
import { BenchmarkResult } from '../types';

export class AerospikeBenchmark {
  private client: Aerospike.Client;

  constructor() {
    this.client = Aerospike.client({
      hosts: config.aerospike.hosts
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async runSetBenchmark(): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const value = 'x'.repeat(config.benchmark.valueSize);

    for (let i = 0; i < config.benchmark.iterations; i++) {
      const key = new Aerospike.Key(config.aerospike.namespace, config.aerospike.set, `key:${i}`);
      await this.client.put(key, { value });
    }

    const totalTime = Date.now() - startTime;

    return {
      operation: 'set',
      database: 'Aerospike',
      operationsPerSecond: (config.benchmark.iterations / totalTime) * 1000,
      averageLatency: totalTime / config.benchmark.iterations,
      totalTime
    };
  }

  async runGetBenchmark(): Promise<BenchmarkResult> {
    const startTime = Date.now();

    for (let i = 0; i < config.benchmark.iterations; i++) {
      const key = new Aerospike.Key(config.aerospike.namespace, config.aerospike.set, `key:${i}`);
      await this.client.get(key);
    }

    const totalTime = Date.now() - startTime;

    return {
      operation: 'get',
      database: 'Aerospike',
      operationsPerSecond: (config.benchmark.iterations / totalTime) * 1000,
      averageLatency: totalTime / config.benchmark.iterations,
      totalTime
    };
  }

  async runBatchGetBenchmark(): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const batches = Math.ceil(config.benchmark.iterations / config.benchmark.batchSize);

    for (let i = 0; i < batches; i++) {
      const batchRecords = Array.from({ length: config.benchmark.batchSize }, 
        (_, j) => ({
          key: new Aerospike.Key(
            config.aerospike.namespace, 
            config.aerospike.set, 
            `key:${i * config.benchmark.batchSize + j}`
          ),
          read_all_bins: true
        })
      );
      await this.client.batchRead(batchRecords);
    }

    const totalTime = Date.now() - startTime;

    return {
      operation: 'batch_get',
      database: 'Aerospike',
      operationsPerSecond: (config.benchmark.iterations / totalTime) * 1000,
      averageLatency: totalTime / config.benchmark.iterations,
      totalTime
    };
  }
}