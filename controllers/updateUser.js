const sequelize = require("../DatabaseConnection/connection");
const User = require("../UserModel/userSchema");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

const updateUserProfile = async (req, res) => {
  try {
    await sequelize.authenticate();
    const { first_name, last_name, password, ...extraFields } = req.body;
    if (Object.keys(req.body).length === 0) {
      logger.warn("Request body cannot be empty");
      res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error: " Request body cannot be empty",
      });
    }

    const validFields = ["first_name", "last_name", "password"];
    const invalidFields = Object.keys(extraFields).filter(
      (key) => !validFields.includes(key)
    );

    if (invalidFields.length > 0) {
      logger.warn("Only first_name, last_name, password are allowed");
      res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error: " Only first_name, last_name, password are allowed",
      });
    }

    if (!first_name && !last_name && !password) {
      logger.warn(
        "At least one field (first_name, last_name, newpassword) must be Provided"
      );
      res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error:
          "At least one field (first_name, last_name, newpassword) must be provided",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.header("Cache-Control", "no-cache");
      logger.warn("No Credentials Provided");
      return res.status(401).json({ error: "No credentials provided" });
    }

    const authData = authHeader.split(" ")[1];
    const decodedAuthData = Buffer.from(authData, "base64").toString("utf-8");
    const [email, Upassword] = decodedAuthData.split(":");

    if (!email || !Upassword) {
      logger.warn("Email and Password are missing");
      res.header("Cache-Control", "no-cache");
      return res.status(401).json({ error: "Email and Password are missing" });
    }

    // Find user in the database
    const user = await User.findOne({ where: { username: email } });

    if (!user) {
      logger.warn("Invalid credentials", email);
      res.header("Cache-Control", "no-cache");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if the provided password matches the user's password
    const isPasswordValid = await bcrypt.compare(Upassword, user.password);

    if (!isPasswordValid) {
      logger.warn("Invalid credentials", email);
      res.header("Cache-Control", "no-cache");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update user's information if provided
    if (first_name) {
      user.first_name = first_name;
    }

    if (last_name) {
      user.last_name = last_name;
    }
    if (password) {
      if (password.trim()) {
        const hashNewPassword = await bcrypt.hash(password, 10);
        user.password = hashNewPassword;
      } else {
        logger.warn("Password cannot be empty");
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({
          error: "Password cannot be empty",
        });
      }
    }

    user.account_updated = new Date();

    // Save the updated user to the database
    await user.save();
    logger.info("Updated User");
    res.header("Cache-Control", "no-cache");
    res.status(204).end();
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      logger.error("Sequelize Validation Error", err);
      const errorMessage = err.errors.map((err) => err.message).join(". ");
      res.header("Cache-Control", "no-cache");
      return res.status(400).json({ error: errorMessage });
    }
    if (err.name === "SequelizeConnectionRefusedError") {
      logger.error("Sequelize Connection Refused Error", err);
      console.error("Service Unavailable");
      res.header("Cache-Control", "no-cache");
      res.status(503).end();
    }
    console.error(err);
    logger.error("Internal Server Error", err);
    res.header("Cache-Control", "no-cache");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = updateUserProfile;
