const express = require("express");
const router = express.Router();
const sequelize = require("../DatabaseConnection/connection");
const User = require("../UserModel/userSchema");
const bcrypt = require("bcrypt");
const logger=require("../logger");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());




router.use((req, res, next) => {
  if (
    req.method === "PATCH" ||
    req.method === "DELETE" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    
    console.log("No other method than Get allowed");
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
    logger.error("Body Not Allowed");
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
      logger.error("Bad Request Only First Name, Last Name, Password and UserName  are allowed");
      res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({
          error:
            "Bad Request - Only first_name, last_name, password, and username are allowed",
        });
    }
    if ( !username|| !password|| !first_name|| !last_name) {
      logger.error("Bad Request - All Fields required");
      res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Bad Request - All Fields required" })
        .end();
    }
    if(password){
        if (!password.trim()) {
            logger.error("Password cannot be empty");
            res.header("Cache-Control", "no-cache");
            return res.status(400).json({
              error: "Password cannot be empty",
            });
          }
        }
        if(username){
            if (!username.trim()) {
                logger.error("UserName cannot be empty");
                res.header("Cache-Control", "no-cache");
                return res.status(400).json({
                  error: "UserName cannot be empty",
                });
              }
            }
            if(first_name){
                if (!first_name.trim()) {
                   logger.error("First Name cannot be empty");
                    res.header("Cache-Control", "no-cache");
                    return res.status(400).json({
                      error: "FirstName cannot be empty",
                    });
                  }
                }

                if(last_name){
                    if (!last_name.trim()) {
                        logger.error("Last Name cannot be empty");
                        res.header("Cache-Control", "no-cache");
                        return res.status(400).json({
                          error: "LastName cannot be empty",
                        });
                      }
                    }
            


  
    const validUser = await User.findOne({ where: { username } });
    if (validUser) {
        logger.error("User Already Exists");
        res.header("Cache-Control", "no-cache");
      return res.status(400).json({ error: "User Alredy Exists" });
    }
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashPass,
      first_name,
      last_name,
      account_created: new Date(),
      account_updated: new Date(),
    });
    const {
      id,
      username: userEmail,
      first_name: userFirstName,
      last_name: userLastName,
      account_created,
      account_updated,
    } = newUser;
    logger.info("Successfully Created User",userEmail);
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
    if (err.name === 'SequelizeValidationError') {
        const errorMessage = error.errors.map(err => err.message).join('. ');
        res.header("Cache-Control", "no-cache");
        logger.error("Sequelize Validation Error",err);
        return res.status(400).json({ error: errorMessage });
    }
    if (err.name === 'SequelizeConnectionRefusedError') {
      logger.error("Sequelize Connection Refused Error",err);
        console.error("Service Unavailable");
        res.header("Cache-Control", "no-cache");
        res.status(503).end();
    }
    logger.error("Internal Server Error",err);
    
    res.header("Cache-Control", "no-cache");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/v1/user/self", async (req, res) => {
    
    if (
        Object.keys(req.body).length !== 0 ||
        (req.query && Object.keys(req.query).length !== 0) ||
        req.headers["content-length"] > 0
      ) {
        logger.error("Body not Allowed");
        console.log("Body not allowed");
        res.header("Cache-Control", "no-cache");
        res.status(400).json({error:"No Body allowed"}).end();
        return;
      }
  try {
    await sequelize.authenticate();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
       res.header("Cache-Control", "no-cache");
       logger.error("No Credentials Provided to Get User");
      return res
        .status(401)
        .json({ error: "No credentials provided" });
    }

    const authData = authHeader.split(" ")[1];
    const decodedAuthData = Buffer.from(authData, "base64").toString("utf-8");
    const [email, password] = decodedAuthData.split(":");

    if (!email || !password) {
      res.header("Cache-Control", "no-cache");
      logger.error("Email and Password are Missing");
      return res
        .status(400)
        .json({ error: "Email and Password are missing" });
    }

    const user = await User.findOne({ where: { username: email } });

    if (!user) {
        res.header("Cache-Control", "no-cache");
        logger.error("Invalid Credentials");
      return res
        .status(401)
        .json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.header("Cache-Control", "no-cache");
        logger.error("Invalid Credentials");
      return res
        .status(401)
        .json({ error: "Invalid credentials" });
    }

    const {
      id,
      username,
      first_name,
      last_name,
      account_created,
      account_updated,
    } = user;
    logger.info("Success of Get Request for",username);
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
    if (err.name === 'SequelizeConnectionRefusedError') {
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

router.put("/v1/user/self", async (req, res) => {
    
  try {
    await sequelize.authenticate();
    const { first_name, last_name, password , ...extraFields} = req.body;
    if (Object.keys(req.body).length === 0) {
        logger.error("Request body cannot be empty");
        res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error: " Request body cannot be empty",
      });
    }

    const validFields = ["first_name", "last_name", "password"];
    const invalidFields = Object.keys(extraFields).filter(
      key => !validFields.includes(key)
    );
    
    if (invalidFields.length > 0) {
        logger.error("Only first_name, last_name, password are allowed");
        res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error: " Only first_name, last_name, password are allowed",
      });
    }

    // Check if at least one of the fields (first_name, last_name, newpassword) is provided
    if (!first_name && !last_name && !password) {
      logger.error("At least one field (first_name, last_name, newpassword) must be Provided");
        res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error:
          "At least one field (first_name, last_name, newpassword) must be provided",
      });
    }

    // Extract email and password from Basic Authentication header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.header("Cache-Control", "no-cache");
        logger.error("No Credentials Provided");
      return res
        .status(400)
        .json({ error: "No credentials provided" });
    }

    const authData = authHeader.split(" ")[1];
    const decodedAuthData = Buffer.from(authData, "base64").toString("utf-8");
    const [email, Upassword] = decodedAuthData.split(":");

    if (!email || !Upassword) {
        logger.error("Email and Password are missing");
        res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Email and Password are missing" });
    }

    // Find user in the database
    const user = await User.findOne({ where: { username: email } });

    if (!user) {
      logger.error("Invalid credentials",email);
        res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Invalid credentials" });
    }

    // Check if the provided password matches the user's password
    const isPasswordValid = await bcrypt.compare(Upassword, user.password);

    if (!isPasswordValid) {
        logger.error("Invalid credentials",email);
        res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Invalid credentials" });
    }

    // Update user's information if provided
    if (first_name) {
      user.first_name = first_name;
    }

    if (last_name) {
      user.last_name = last_name;
    }
    if(password){
    if (password.trim()) {
        const hashNewPassword = await bcrypt.hash(password, 10);
        user.password = hashNewPassword;
      } else {
        logger.error("Password cannot be empty");
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({
          error: "Password cannot be empty",
        });
      }
    }

    // Set the account_updated field to the current date
    user.account_updated = new Date();

    // Save the updated user to the database
    await user.save();
    logger.info("Updated User",email);
    res.header("Cache-Control", "no-cache");
    res.status(204).end();
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      logger.error("Sequelize Validation Error",err);
        const errorMessage = error.errors.map(err => err.message).join('. ');
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({ error: errorMessage });
    }
    if (err.name === 'SequelizeConnectionRefusedError') {
        logger.error("Sequelize Connection Refused Error",err);
        console.error("Service Unavailable");
        res.header("Cache-Control", "no-cache");
        res.status(503).end();
    }
    console.error(err);
    logger.error("Internal Server Error",err);
    res.header("Cache-Control", "no-cache");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("*", async (req, res) => {
  console.log("Bad Route");
  logger.error("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
});

router.post("*", async (req, res) => {
  console.log("Bad Route");
  logger.error("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
});

router.put("*", async (req, res) => {
  logger.error("Bad Route",error);
  console.log("Bad Route");
  
  res.status(405).end();
});

module.exports = router;
