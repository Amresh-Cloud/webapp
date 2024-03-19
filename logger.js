const winston = require("winston");
const { format } = winston;


const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "/var/log/webapp/logger.log" }),
  ],
});
logger.error("logger running");
module.exports = logger;
