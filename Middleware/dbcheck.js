const sequelize = require("../DatabaseConnection/connection");
const logger=require("../logger");
const dbCheck = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    next();
  } catch (err) {
    logger.error("Database Not Connected", err);
    console.log("Database Not Connected");
    res.header("Cache-Control", "no-cache");
    res.status(503).end();
  }
};
module.exports = dbCheck;
