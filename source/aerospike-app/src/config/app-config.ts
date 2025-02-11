import dotenv from "dotenv";
import {
  AEROSPIKE_HOST,
  AEROSPIKE_PORT,
  AEROSPIKE_NAMESPACE,
  AEROSPIKE_SET,
  AEROSPIKE_TIMEOUT,
  AEROSPIKE_RECONNECT_TIMEOUT,
  AEROSPIKE_CONNECT_TIMEOUT,
  AEROSPIKE_MAX_RETRIES,
  AEROSPIKE_POLICY_KEY
} from "./aerospike";

dotenv.config();

export interface IAppConfig {
  app: {
    name: string;
    env: string;
    timezone: string;
    maxMemoryUsage: number;
    shutdownTimeout: number;
  };
  aerospike: {
    host: string;
    port: number;
    namespace: string;
    set: string;
    options: {
      connectTimeout: number;
      reconnectTimeout: number;
      maxRetries: number;
      policyKey: string;
    };
  };
}

export const config: IAppConfig = {
  app: {
    name: process.env.APP_NAME || "aerospike-app",
    env: process.env.NODE_ENV || "development",
    timezone: process.env.APP_TIMEZONE || "Asia/Dhaka",
    maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE || "256", 10), // MB
    shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT || "3000", 10), // ms
  },
  aerospike: {
    host: AEROSPIKE_HOST,
    port: AEROSPIKE_PORT,
    namespace: AEROSPIKE_NAMESPACE,
    set: AEROSPIKE_SET,
    options: {
      connectTimeout: AEROSPIKE_CONNECT_TIMEOUT,
      reconnectTimeout: AEROSPIKE_RECONNECT_TIMEOUT,
      maxRetries: AEROSPIKE_MAX_RETRIES,
      policyKey: AEROSPIKE_POLICY_KEY,
    },
  },
};