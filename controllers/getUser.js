const sequelize = require("../DatabaseConnection/connection");
const User = require("../UserModel/userSchema");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

const getUserProfile = async (req, res) => {
  if (
    Object.keys(req.body).length !== 0 ||
    (req.query && Object.keys(req.query).length !== 0) ||
    req.headers["content-length"] > 0
  ) {
    logger.warn("Body not Allowed");
    console.log("Body not allowed");
    res.header("Cache-Control", "no-cache");
    res.status(400).json({ error: "No Body allowed" }).end();
    return;
  }
  try {
    await sequelize.authenticate();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.header("Cache-Control", "no-cache");
      logger.warn("No Credentials Provided to Get User");
      return res.status(401).json({ error: "No credentials provided" });
    }

    const authData = authHeader.split(" ")[1];
    const decodedAuthData = Buffer.from(authData, "base64").toString("utf-8");
    const [email, password] = decodedAuthData.split(":");

    if (!email || !password) {
      res.header("Cache-Control", "no-cache");
      logger.warn("Email and Password are Missing");
      return res.status(400).json({ error: "Email and Password are missing" });
    }

    const user = await User.findOne({ where: { username: email } });

    if (!user) {
      res.header("Cache-Control", "no-cache");
      logger.warn("Invalid Credentials");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.header("Cache-Control", "no-cache");
      logger.warn("Invalid Credentials");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const {
      id,
      username,
      first_name,
      last_name,
      account_created,
      account_updated,
    } = user;
    logger.info("Success of Get Request");
    res.header("Cache-Control", "no-cache");
    res.status(200).json({
      id,
      username,
      first_name,
      last_name,
      account_created,
      account_updated,
    });
  } catch (err) {
    if (err.name === "SequelizeConnectionRefusedError") {
      logger.error("Service Unavailable");
      console.error("Service Unavailable");
      res.header("Cache-Control", "no-cache");
      res.status(503).end();
    }
    logger.error("Internal Server Error");
    console.error(err);
    res.header("Cache-Control", "no-cache");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getUserProfile;
