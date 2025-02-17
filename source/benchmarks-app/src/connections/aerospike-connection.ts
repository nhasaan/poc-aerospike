import Aerospike from "aerospike";
import { config } from "../config/app-config";
import { logger } from "../loggers";

const aerospikeConfig = {
  hosts: [{
    addr: config.aerospike.host,
    port: config.aerospike.port
  }],
  port: config.aerospike.port,
  policies: {
    read: {
      totalTimeout: config.aerospike.options.connectTimeout,
      key: Aerospike.policy.key[config.aerospike.options.policyKey as keyof typeof Aerospike.policy.key],
      maxRetries: config.aerospike.options.maxRetries
    },
    write: {
      totalTimeout: config.aerospike.options.connectTimeout,
      key: Aerospike.policy.key[config.aerospike.options.policyKey as keyof typeof Aerospike.policy.key],
      maxRetries: config.aerospike.options.maxRetries
    }
  },
  connTimeoutMs: config.aerospike.options.connectTimeout,
  log: {
    level: Aerospike.log.INFO
  },
  useAlternateAccessAddress: false,
  setDefaultPolicies: true
};


class AerospikeConnection {
  private static instance: Aerospike.Client;

  static async getInstance(): Promise<Aerospike.Client> {
    if (!this.instance) {
      try {
        this.instance = await Aerospike.connect(aerospikeConfig);
        logger.info({
          message: "[Aerospike] connected",
          tag: "connected",
        });

        this.instance.on("error", (error) => {
          logger.error({
            message: "[Aerospike] Error",
            result: error,
            tag: "error",
          });
        });

        if (config?.app.env === "production") {
          process.on("SIGTERM", () => {
            logger.info({
              message:
                "[Aerospike] SIGTERM signal received. Closing aerospike connection",
              tag: "aerospike",
            });
            this.instance?.close();
          });
        }
      } catch (error) {
        logger.error({
          message: "[Aerospike] Connection Error",
          result: error,
          tag: "error",
        });
        throw error;
      }
    }
    return this.instance;
  }
}

export default AerospikeConnection;
