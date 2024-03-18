const express = require("express");
const app = express();
const sequelize = require("./DatabaseConnection/connection");
const routes=require("./RouteHandler/routes");
const dbCheck = require("./Middleware/dbcheck");
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');


const loggingWinston = new LoggingWinston();

// Create a Winston logger that streams to Cloud Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = winston.createLogger({
  level: 'info',
transports: [
  new winston.transports.Console(),
  loggingWinston,
 
],
});



// Writes some log entries
logger.error('warp nacelles offline');
logger.info('shields at 99%');
const port = process.env.PORT || 2500;
app.use("/v1",dbCheck);
app.use(routes);

app.listen(port, () => {
  sequelize.sync({force:true}).then(console.log('Server at port',port));

});
module.exports=app;
module.exports=logger;
