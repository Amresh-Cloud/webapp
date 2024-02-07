const sequelize = require("../DatabaseConnection/connection");
const dbCheck = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    next();
  } catch (error) {
    console.log("Database Not Connected");
    res.header("Cache-Control", "no-cache");
    res.status(503).end();
  }
};
module.exports = dbCheck;
