const sequelize = require("../DatabaseConnection/connection");
const User = require("../UserModel/userSchema");
const logger = require("../utils/logger");

// Verify user based on user ID
const verifyUsers = async (req, res) => {
  try {
    await sequelize.authenticate();

    const userId = req.query.id; // Extract user ID from query parameters

    if (!userId) {
      logger.warn("User ID is missing in the query parameters");
      return res
        .status(400)
        .json({ error: "User ID is missing in the query parameters" });
    }

    // Find user by primary key (ID)
    const user = await User.findByPk(userId);

    if (!user) {
      logger.warn("User not found with the provided ID");
      return res
        .status(404)
        .json({ error: "User not found with the provided ID" });
    }

    // Check if the user is already verified
    if (user.verified_user) {
      logger.warn("User is already verified");
      return res.status(400).json({ error: "User is already verified" });
    }

    // Calculate the time difference between token sent and current time
    const tokenSentTime = new Date(user.token_sent_timestamp);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime - tokenSentTime);
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));

    // Verify if the token has expired (2 minutes threshold)
    if (minutesDifference >= 2) {
      logger.warn("Verification token expired");
      return res.status(400).json({ error: "Verification token expired" });
    }

    // Mark user as verified and save changes to the database
    user.verified_user = true;
    await user.save();

    logger.info("User verified successfully");
    return res.status(200).json({ message: "User verified successfully" });
  } catch (err) {
    logger.error("Error verifying user", err);
    console.error(err); // Log the error to the console for debugging

    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = verifyUsers;
