const express = require("express");
const app = express();
const sequelize = require("../webapp-fork1/DatabaseConnection/connection");
const routes=require("../webapp-fork1/RouteHandler/routes");
const dbCheck = require("../webapp-fork1/Middleware/dbcheck");


const port = 1000;
app.use("/v1",dbCheck);
app.use(routes);

app.listen(port, () => {
  sequelize.sync({force:true}).then(console.log("Server at port 1000"));
});
