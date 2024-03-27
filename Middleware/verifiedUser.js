const sequelize = require("../DatabaseConnection/connection");
const logger = require("../utils/logger");
const User = require("../UserModel/userSchema");

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No credentials provided" });
    }

    const authData = authHeader.split(" ")[1];
    const decodedAuthData = Buffer.from(authData, "base64").toString("utf-8");
    const [email] = decodedAuthData.split(":");

    if (!email) {
      return res.status(400).json({ error: "Email is missing" });
    }

    const user = await User.findOne({ where: { username: email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.verified_user) {
      return res.status(403).json({ error: "User is not verified" });
    }

    next();
  } catch (err) {
    console.error("Error in verifyUser middleware:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = verifyUser;