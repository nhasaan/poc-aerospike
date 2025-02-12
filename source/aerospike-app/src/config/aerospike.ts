export const AEROSPIKE_HOST = process.env.AEROSPIKE_HOST || "host.docker.internal";
export const AEROSPIKE_PORT = parseInt(process.env.AEROSPIKE_PORT || "3004", 10);
export const AEROSPIKE_NAMESPACE = process.env.AEROSPIKE_NAMESPACE || "test";
export const AEROSPIKE_SET = process.env.AEROSPIKE_SET || "demo";
export const AEROSPIKE_TIMEOUT = parseInt(process.env.AEROSPIKE_TIMEOUT || "1000", 10);
export const AEROSPIKE_RECONNECT_TIMEOUT = parseInt(process.env.AEROSPIKE_RECONNECT_TIMEOUT || "1000", 10);
export const AEROSPIKE_CONNECT_TIMEOUT = parseInt(process.env.AEROSPIKE_CONNECT_TIMEOUT || "1000", 10);
export const AEROSPIKE_MAX_RETRIES = parseInt(process.env.AEROSPIKE_MAX_RETRIES || "3", 10);
export const AEROSPIKE_POLICY_KEY = process.env.AEROSPIKE_POLICY_KEY || "DIGEST";