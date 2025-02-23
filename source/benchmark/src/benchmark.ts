import { RedisBenchmark } from "./databases/redis";
import { AerospikeBenchmark } from "./databases/aerospike";
import { BenchmarkResult } from "./types";

async function runBenchmarks(): Promise<void> {
  const redis = new RedisBenchmark();
  const aerospike = new AerospikeBenchmark();

  try {
    // Connect to databases
    await Promise.all([redis.connect(), aerospike.connect()]);

    // Run SET benchmarks
    console.log("\nRunning SET benchmarks...");
    const redisSetResults = await redis.runSetBenchmark();
    const aerospikeSetResults = await aerospike.runSetBenchmark();
    printResults([redisSetResults, aerospikeSetResults]);

    // Run GET benchmarks
    console.log("\nRunning GET benchmarks...");
    const redisGetResults = await redis.runGetBenchmark();
    const aerospikeGetResults = await aerospike.runGetBenchmark();
    printResults([redisGetResults, aerospikeGetResults]);

    // Run batch GET benchmarks
    console.log("\nRunning batch GET benchmarks...");
    const redisBatchResults = await redis.runBatchGetBenchmark();
    const aerospikeBatchResults = await aerospike.runBatchGetBenchmark();
    printResults([redisBatchResults, aerospikeBatchResults]);
  } catch (error) {
    console.error("Benchmark error:", error);
  } finally {
    // Cleanup
    await Promise.all([redis.disconnect(), aerospike.disconnect()]);
  }
}

function printResults(results: BenchmarkResult[]): void {
  console.table(
    results.map((result) => ({
      Database: result.database,
      Operation: result.operation,
      "Ops/sec": Math.round(result.operationsPerSecond),
      "Avg Latency (ms)": result.averageLatency.toFixed(3),
      "Total Time (s)": (result.totalTime / 1000).toFixed(2),
    }))
  );
}

// Run the benchmarks
runBenchmarks().catch(console.error);
