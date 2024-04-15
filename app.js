const express = require("express");
const app = express();
const sequelize = require("./DatabaseConnection/connection");
const routes=require("./RouteHandler/routes");
const dbCheck = require("./Middleware/dbcheck");
const logger=require("./utils/logger");
const port = process.env.PORT || 2500;
app.use("/v2",dbCheck);
app.use(routes);

app.listen(port, () => {
  sequelize.sync().then(console.log('Server at port',port));
  logger.info("App is Running on port");

});
module.exports=app;

