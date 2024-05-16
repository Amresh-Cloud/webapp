const logger = require("../utils/logger");

const methodNotAllowed = (req, res, next) => {
  if (
    req.method === "PATCH" ||
    req.method === "DELETE" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    logger.warn("Method not Allowed");
    res.header("Cache-Control", "no-cache");
    res.status(405).end(); // Respond with 405 Method Not Allowed
  } else {
    next(); // Continue to the next middleware or route handler
  }
};

module.exports = methodNotAllowed;
