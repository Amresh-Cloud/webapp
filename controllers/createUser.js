const sequelize = require("../DatabaseConnection/connection");
const User = require("../UserModel/userSchema");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const { publishMessageToPubSub } = require("../utils/pubsub");

// Create a new user
const createUser = async (req, res) => {
  try {
    await sequelize.authenticate();
    const { first_name, last_name, password, username, ...extraFields } =
      req.body;
    if (Object.keys(extraFields).length !== 0) {
      logger.warn(
        "Bad Request Only First Name, Last Name, Password and UserName  are allowed"
      );
      res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error:
          "Bad Request - Only first_name, last_name, password, and username are allowed",
      });
    }
    if (!username || !password || !first_name || !last_name) {
      logger.warn("Bad Request - All Fields required");
      res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Bad Request - All Fields required" })
        .end();
    }
    if (password) {
      if (!password.trim()) {
        logger.warn("Password cannot be empty");
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({
          error: "Password cannot be empty",
        });
      }
    }
    if (username) {
      if (!username.trim()) {
        logger.warn("UserName cannot be empty");
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({
          error: "UserName cannot be empty",
        });
      }
    }
    if (first_name) {
      if (!first_name.trim()) {
        logger.warn("First Name cannot be empty");
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({
          error: "FirstName cannot be empty",
        });
      }
    }

    if (last_name) {
      if (!last_name.trim()) {
        logger.warn("Last Name cannot be empty");
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({
          error: "LastName cannot be empty",
        });
      }
    }

    const validUser = await User.findOne({ where: { username } });
    if (validUser) {
      logger.warn("User Already Exists");
      res.header("Cache-Control", "no-cache");
      return res.status(400).json({ error: "User Alredy Exists" });
    }
    let verifiedUser = false;
    // Check if the email follows the pattern for manual verification
    if (username && username.endsWith("@test.com")) {
      verifiedUser = true;
    }
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashPass,
      first_name,
      last_name,
      account_created: new Date(),
      account_updated: new Date(),
      verified_user: verifiedUser,
    });
    const {
      id,
      username: userEmail,
      first_name: userFirstName,
      last_name: userLastName,
      account_created,
      account_updated,
    } = newUser;
    const userPayload = {
      id: newUser.id,
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    };

    // Publish message to Pub/Sub after user creation
    if (verifiedUser === false) {
      await publishMessageToPubSub(userPayload);
    }
    logger.info("Successfully Created a User");
    res.header("Cache-Control", "no-cache");
    res.status(201).json({
      id,
      userEmail,
      userFirstName,
      userLastName,
      account_created,
      account_updated,
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const errorMessage = err.errors.map((err) => err.message).join(". ");
      res.header("Cache-Control", "no-cache");
      logger.error("Sequelize Validation Error", err);
      return res.status(400).json({ error: errorMessage });
    }
    if (err.name === "SequelizeConnectionRefusedError") {
      logger.error("Sequelize Connection Refused Error", err);
      console.error("Service Unavailable");
      res.header("Cache-Control", "no-cache");
      res.status(503).end();
    }
    logger.error("Internal Server Error", err);

    res.header("Cache-Control", "no-cache");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = createUser;
