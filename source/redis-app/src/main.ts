import redisConnection from "./redis/redis-connection";

async function testRedisPerformance() {
  const key = "test-key";
  const value = "test-value";

  console.time("Redis Set");
  await redisConnection.set(key, value);
  console.timeEnd("Redis Set");

  console.time("Redis Get");
  const result = await redisConnection.get(key);
  console.timeEnd("Redis Get");

  console.log(`Value fetched from Redis: ${result}`);

  redisConnection.disconnect();
}

testRedisPerformance().catch(console.error);
