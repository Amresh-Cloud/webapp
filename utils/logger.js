const winston = require("winston");
const { format } = winston;
const { format: dateFormat, subHours } = require("date-fns");

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "/var/log/webapp/logger.log",
      format: format.combine(
        format((info) => {
          const edtTimestamp = subHours(info.timestamp, 4);
          info.timestamp = dateFormat(
            edtTimestamp,
            "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          );
          return info;
        })()
      ),
    }),
  ],
});

logger.error("logger running");
module.exports = logger;
