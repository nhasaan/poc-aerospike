export const REDIS_HOST = process.env.REDIS_HOST || "host.docker.internal";
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6381", 10);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
export const REDIS_USERNAME= process.env.REDIS_USERNAME || "";
export const REDIS_PREFIX = process.env.REDIS_PREFIX || "redis-app:";
export const REDIS_DB = parseInt(process.env.REDIS_DB || "0", 10);
export const REDIS_FAMILY = parseInt(process.env.REDIS_FAMILY || "4", 10);
export const REDIS_TIMEOUT = parseInt(process.env.REDIS_TIMEOUT || "1000", 10);
export const REDIS_RECONNECT_TIMEOUT = parseInt(process.env.REDIS_RECONNECT_TIMEOUT || "1000", 10);
export const REDIS_LAZY = process.env.REDIS_LAZY === "true" || true;
export const REDIS_RETRY = parseInt(process.env.REDIS_RETRY || "3", 10);
export const REDIS_URL = `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;
