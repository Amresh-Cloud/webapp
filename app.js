const express = require("express");
const app = express();
const sequelize = require("../Cloud/DatabaseConnection/connection");
const routes=require("../Cloud/RoutesHandler/routes");


const port = 1000;
app.use(routes);

app.listen(port, () => {
  sequelize.sync({force:true}).then(console.log("Server at port 1000"));
});
