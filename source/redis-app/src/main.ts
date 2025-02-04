import Redis from 'ioredis';

const redis = new Redis("host.docker.internal:6381");

async function testRedisPerformance() {
  const key = 'test-key';
  const value = 'test-value';

  console.time('Redis Set');
  await redis.set(key, value);
  console.timeEnd('Redis Set');

  console.time('Redis Get');
  const result = await redis.get(key);
  console.timeEnd('Redis Get');

  console.log(`Value fetched from Redis: ${result}`);

  redis.disconnect();
}

testRedisPerformance().catch(console.error);