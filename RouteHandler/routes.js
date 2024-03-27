const express = require("express");
const router = express.Router();
const sequelize = require("../DatabaseConnection/connection");
const User = require("../UserModel/userSchema");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const { publishMessageToPubSub } = require("../utils/pubsub");
const verifyUser = require("../Middleware/verifiedUser");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.use((req, res, next) => {
  if (
    req.method === "PATCH" ||
    req.method === "DELETE" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    logger.warn("Method not Allowed");

    res.header("Cache-Control", "no-cache");
    res.status(405).end();
  } else {
    next();
  }
});

router.get("/healthz", async (req, res) => {
  if (
    Object.keys(req.body).length !== 0 ||
    (req.query && Object.keys(req.query).length !== 0) ||
    req.headers["content-length"] > 0
  ) {
    logger.warn("Body Not Allowed");
    console.log("Body not allowed");
    res.header("Cache-Control", "no-cache");
    res.status(400).end();
    return;
  }
  try {
    await sequelize.authenticate();
    logger.info("Connected to Database");
    console.log("Connected to Database");
    res.header("Cache-Control", "no-cache");
    res.status(200).end();
  } catch (err) {
    logger.error("Database Not Connected");
    console.log("Database Not Connected", err);
    res.header("Cache-Control", "no-cache");
    res.status(503).end();
  }
});

router.post("/v1/user", async (req, res) => {
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
    if(verifiedUser===false){
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
});

router.get("/v1/user/self", verifyUser, async (req, res) => {
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
});

router.put("/v1/user/self", verifyUser, async (req, res) => {
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
});
router.get("/v1/user/verify", async (req, res) => {
  try {
    await sequelize.authenticate();
    const userId = req.query.id; // Extract user ID from query parameters

    if (!userId) {
      logger.warn("User ID is missing in the query parameters");
      return res.status(400).json({ error: "User ID is missing in the query parameters" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      logger.warn("User not found with the provided ID");
      return res.status(404).json({ error: "User not found with the provided ID" });
    }

    if (user.verified_user) {
      logger.warn("User is already verified");
      return res.status(400).json({ error: "User is already verified" });
    }

 
    const tokenSentTime = new Date(user.token_sent_timestamp);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime - tokenSentTime);
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));

    if (minutesDifference >= 2) {
      logger.warn("Verification token expired");
      return res.status(400).json({ error: "Verification token expired" });
    }

    user.verified_user = true;
    await user.save();

    logger.info("User verified successfully");
    return res.status(200).json({ message: "User verified successfully" });
  } catch (err) {
    logger.error("Error verifying user", err);
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("*", async (req, res) => {
  console.log("Bad Route");
  logger.warn("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
});

router.post("*", async (req, res) => {
  console.log("Bad Route");
  logger.warn("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
});

router.put("*", async (req, res) => {
  logger.warn("Bad Route", error);
  console.log("Bad Route");

  res.status(405).end();
});

module.exports = router;