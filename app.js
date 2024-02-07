const express = require("express");
const app = express();
const sequelize = require("../webapp-fork1/DatabaseConnection/connection");
const routes=require("../webapp-fork1/RouteHandler/routes");


const port = 1000;
app.use(routes);

app.listen(port, () => {
  sequelize.sync({force:true}).then(console.log("Server at port 1000"));
});
