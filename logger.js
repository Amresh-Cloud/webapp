const winston = require("winston");
const { LoggingWinston } = require("@google-cloud/logging-winston");
const { format } = require("winston");


const projectId = "devv-414701";
const keyFilename =
  "/Users/amreshrajvindersingh/Documents/Applications/Keys/devv-414701-8f340b8f8963.json"; // Replace './path/to/your/google-cloud-key.json' with the actual path to your JSON key file

const loggingWinston = new LoggingWinston({
  projectId: projectId,
  keyFilename: keyFilename,
});

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new winston.transports.Console(),
    loggingWinston,
    new winston.transports.File({ filename: "/var/log/webapp/logger.log" }),
  ],
});
logger.error("logger running");
module.exports = logger;
