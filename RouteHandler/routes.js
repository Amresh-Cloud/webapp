const express = require("express");
const router = express.Router();
const sequelize = require("../DatabaseConnection/connection");
const User = require("../UserModel/userSchema");
const bcrypt = require("bcrypt");

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
    console.log("Body not allowed");
    res.header("Cache-Control", "no-cache");
    res.status(400).end();
    return;
  }
  try {
    await sequelize.authenticate();
    console.log("Connected to Database");
    res.header("Cache-Control", "no-cache");
    res.status(200).end();
  } catch (err) {
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
      res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({
          error:
            "Bad Request - Only first_name, last_name, password, and username are allowed",
        });
    }
    if ( !username|| !password|| !first_name|| !last_name) {
      res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Bad Request - All Fields required" })
        .end();
    }
    if(password){
        if (!password.trim()) {
            res.header("Cache-Control", "no-cache");
            return res.status(400).json({
              error: "Password cannot be empty",
            });
          }
        }
        if(username){
            if (!username.trim()) {
                res.header("Cache-Control", "no-cache");
                return res.status(400).json({
                  error: "UserName cannot be empty",
                });
              }
            }
            if(first_name){
                if (!first_name.trim()) {
                    res.header("Cache-Control", "no-cache");
                    return res.status(400).json({
                      error: "FirstName cannot be empty",
                    });
                  }
                }

                if(last_name){
                    if (!last_name.trim()) {
                        res.header("Cache-Control", "no-cache");
                        return res.status(400).json({
                          error: "LastName cannot be empty",
                        });
                      }
                    }
            


  
    const validUser = await User.findOne({ where: { username } });
    if (validUser) {
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
    res.header("Cache-Control", "no-cache");
    res.status(201).json({
      id,
      userEmail,
      userFirstName,
      userLastName,
      account_created,
      account_updated,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
        const errorMessage = error.errors.map(err => err.message).join('. ');
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({ error: errorMessage });
    }
    if (error.name === 'SequelizeConnectionRefusedError') {
        console.error("Service Unavailable");
        res.header("Cache-Control", "no-cache");
        res.status(503).end();
    }
    console.error(error);
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
      return res
        .status(401)
        .json({ error: "No credentials provided" });
    }

    const authData = authHeader.split(" ")[1];
    const decodedAuthData = Buffer.from(authData, "base64").toString("utf-8");
    const [email, password] = decodedAuthData.split(":");

    if (!email || !password) {
      res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Email and Password are missing" });
    }

    const user = await User.findOne({ where: { username: email } });

    if (!user) {
        res.header("Cache-Control", "no-cache");
      return res
        .status(401)
        .json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.header("Cache-Control", "no-cache");
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
    res.header("Cache-Control", "no-cache");
    res.status(200).json({
      id,
      username,
      first_name,
      last_name,
      account_created,
      account_updated,
    });
  } catch (error) {
    if (error.name === 'SequelizeConnectionRefusedError') {
        console.error("Service Unavailable");
        res.header("Cache-Control", "no-cache");
        res.status(503).end();
    }
    console.error(error);
    res.header("Cache-Control", "no-cache");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/v1/user/self", async (req, res) => {
    
  try {
    await sequelize.authenticate();
    const { first_name, last_name, password , ...extraFields} = req.body;
    if (Object.keys(req.body).length === 0) {
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
        res.header("Cache-Control", "no-cache");
      return res.status(400).json({
        error: " Only first_name, last_name, password, and username are allowed",
      });
    }

    // Check if at least one of the fields (first_name, last_name, newpassword) is provided
    if (!first_name && !last_name && !password) {
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
      return res
        .status(400)
        .json({ error: "No credentials provided" });
    }

    const authData = authHeader.split(" ")[1];
    const decodedAuthData = Buffer.from(authData, "base64").toString("utf-8");
    const [email, Upassword] = decodedAuthData.split(":");

    if (!email || !Upassword) {
        res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Email and Password are missing" });
    }

    // Find user in the database
    const user = await User.findOne({ where: { username: email } });

    if (!user) {
        res.header("Cache-Control", "no-cache");
      return res
        .status(400)
        .json({ error: "Invalid credentials" });
    }

    // Check if the provided password matches the user's password
    const isPasswordValid = await bcrypt.compare(Upassword, user.password);

    if (!isPasswordValid) {
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
    res.header("Cache-Control", "no-cache");
    res.status(204).end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
        const errorMessage = error.errors.map(err => err.message).join('. ');
        res.header("Cache-Control", "no-cache");
        return res.status(400).json({ error: errorMessage });
    }
    if (error.name === 'SequelizeConnectionRefusedError') {
        console.error("Service Unavailable");
        res.header("Cache-Control", "no-cache");
        res.status(503).end();
    }
    console.error(error);
    res.header("Cache-Control", "no-cache");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("*", async (req, res) => {
  console.log("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
});

router.post("*", async (req, res) => {
  console.log("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
});

router.put("*", async (req, res) => {
  console.log("Bad Route");
  
  res.status(405).end();
});

module.exports = router;
