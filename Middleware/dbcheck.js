const sequelize = require("../DatabaseConnection/connection");
const logger=require("../app");
const dbCheck = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    next();
  } catch (error) {
    logger.error("Database Not Connected", error);
    console.log("Database Not Connected");
    res.header("Cache-Control", "no-cache");
    res.status(503).end();
  }
};
module.exports = dbCheck;
