export class Benchmark {
  async measure(fn: () => Promise<void>): Promise<{ duration: number; ops: number; memoryDiff: any }> {
    const start = process.hrtime();
    const startMemory = process.memoryUsage();
    
    await fn();
    
    const diff = process.hrtime(start);
    const duration = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
    
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
      arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
    };

    return {
      duration,
      ops: 1000 / duration, // Operations per second
      memoryDiff
    };
  }
}