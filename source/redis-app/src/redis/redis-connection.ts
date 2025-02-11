import Redis from "ioredis";
import { config } from "../config";
import { logger } from "../loggers";

const redisConnection = new Redis(config.redis.url, config.redis.options);

redisConnection.on("connect", function () {
  logger.info({
    message: "[Redis] connected",
    tag: "connected",
  });
});

redisConnection.on("reconnecting", function () {
  logger.warn({
    message: "[Redis] Reconnecting",
    tag: "reconnecting",
  });
});

redisConnection.on("error", function (err: any) {
  logger.error({
    message: "[Redis] Error",
    result: err,
    tag: "error",
  });
});

redisConnection.on("close", function () {
  logger.info({
    message: "[Redis] close",
    tag: "error",
  });
});

if (config?.app.env === "production") {
  process.on("SIGTERM", () => {
    logger.info({
      message: "[Redis] SIGTERM signal received. Closing redis server",
      tag: "redis",
    });
    redisConnection.quit();
  });
}

export default redisConnection;
