const sequelize = require("../DatabaseConnection/connection");
const logger = require("../utils/logger");

const healthCheckController = async (req, res) => {
  try {
    // Check if request body, query parameters, or content length headers are present
    if (
      Object.keys(req.body).length !== 0 ||
      (req.query && Object.keys(req.query).length !== 0) ||
      req.headers["content-length"] > 0
    ) {
      logger.warn("Body Not Allowed");
      console.log("Body not allowed");
      res.header("Cache-Control", "no-cache");
      return res.status(400).end();
    }

    // Check database connectivity
    await sequelize.authenticate();
    logger.info("Connected to Database");
    console.log("Connected to Database");

    res.header("Cache-Control", "no-cache");
    return res.status(200).end();
  } catch (err) {
    logger.error("Database Not Connected", err);
    console.log("Database Not Connected", err);
    res.header("Cache-Control", "no-cache");
    return res.status(503).end();
  }
};

module.exports = healthCheckController;
