const express = require("express");
const app = express();
const sequelize = require("./DatabaseConnection/connection");
const routes=require("./RouteHandler/routes");
const dbCheck = require("./Middleware/dbcheck");


const port = 1000;
app.use("/v1",dbCheck);
app.use(routes);

app.listen(port, () => {
  sequelize.sync({force:true}).then(console.log("Server at port 1000"));
});
module.exports=app;