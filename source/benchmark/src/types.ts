export interface BenchmarkResult {
  operation: string;
  database: string;
  operationsPerSecond: number;
  averageLatency: number;
  totalTime: number;
}