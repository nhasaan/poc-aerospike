import Aerospike from 'aerospike';

async function testAerospikePerformance() {
  const config = {
    hosts: '127.0.0.1:3000' // Adjust the host and port as needed
  };

  const client = await Aerospike.connect(config);
  const key = new Aerospike.Key('test', 'demo', 'test-key');
  const record = { test: 'test-value' };

  console.time('Aerospike Put');
  await client.put(key, record);
  console.timeEnd('Aerospike Put');

  console.time('Aerospike Get');
  const recordFetched = await client.get(key);
  console.timeEnd('Aerospike Get');

  console.log(`Value fetched from Aerospike: ${recordFetched.bins.test}`);

  await client.close();
}

testAerospikePerformance().catch(console.error);