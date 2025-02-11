import Aerospike from "aerospike";
import { config } from "./config";

async function testAerospikePerformance() {
  const AerospikeConnection = await Aerospike.connect(config.aerospike);
  const key = new Aerospike.Key(
    config.aerospike.namespace,
    config.aerospike.set,
    "test-key"
  );
  const record = { test: "test-value" };

  console.time("Aerospike Put");
  await AerospikeConnection.put(key, record);
  console.timeEnd("Aerospike Put");

  console.time("Aerospike Get");
  const recordFetched = await AerospikeConnection.get(key);
  console.timeEnd("Aerospike Get");

  console.log(`Value fetched from Aerospike: ${recordFetched.bins.test}`);

  await AerospikeConnection.close();
}

testAerospikePerformance().catch(console.error);
