const Sequelize=require('sequelize');
const dotenv=require('dotenv');
dotenv.config();
const sequelize = new Sequelize(process.env.DBNAME,process.env.DBUSER,process.env.DBPASSWORD,{
dialect:'mysql',
host:process.env.DBHOST,
port:process.env.DBPORT,
});
module.exports = sequelize;

