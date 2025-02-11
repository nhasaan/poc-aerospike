import dotenv from "dotenv";
import {
  REDIS_DB,
  REDIS_FAMILY,
  REDIS_HOST,
  REDIS_LAZY,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_PREFIX,
  REDIS_RECONNECT_TIMEOUT,
  REDIS_RETRY,
  REDIS_TIMEOUT,
  REDIS_URL,
  REDIS_USERNAME,
} from "./redis";

dotenv.config();

export interface IAppConfig {
  app: {
    name: string;
    env: string;
    timezone: string;
    maxMemoryUsage: number;
    shutdownTimeout: number;
  };
  redis: {
    url: string;
    host: string;
    port: number;
    username: string;
    password: string;
    db: number;
    options: {
      family: number;
      connectTimeout: number;
      lazyConnect: boolean;
      maxRetriesPerRequest: number;
      keyPrefix: string;
      reconnectTimeout: number;
    };
  };
}

export const config: IAppConfig = {
  app: {
    name: process.env.APP_NAME || "redis-app",
    env: process.env.NODE_ENV || "development",
    timezone: process.env.APP_TIMEZONE || "Asia/Dhaka",
    maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE || "256", 10), // MB
    shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT || "3000", 10), // ms
  },
  redis: {
    url: REDIS_URL,
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    options: {
      family: REDIS_FAMILY,
      connectTimeout: REDIS_TIMEOUT,
      lazyConnect: REDIS_LAZY,
      maxRetriesPerRequest: REDIS_RETRY,
      keyPrefix: REDIS_PREFIX,
      reconnectTimeout: REDIS_RECONNECT_TIMEOUT,
    },
  },
};
