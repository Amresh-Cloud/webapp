const logger = require("../utils/logger");

// Controller for handling GET requests on wildcard route *
const handleWildcardGet = async (req, res) => {
  console.log("Bad Route GET requests on wildcard route");
  logger.warn("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
};

// Controller for handling POST requests on wildcard route *
const handleWildcardPost = async (req, res) => {
  console.log("Bad Route POST requests on wildcard route");
  logger.warn("Bad Route");
  res.header("Cache-Control", "no-cache");
  res.status(405).end();
};

// Controller for handling PUT requests on wildcard route *
const handleWildcardPut = async (req, res) => {
  console.log("Bad Route PUT requests on wildcard route");
  logger.warn("Bad Route");
  res.status(405).end();
};

module.exports = {
  handleWildcardGet,
  handleWildcardPost,
  handleWildcardPut,
};
