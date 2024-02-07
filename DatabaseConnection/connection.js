const Sequelize=require('sequelize');
const dotenv=require('dotenv');
const mysql=require('mysql2/promise');
dotenv.config();
const db = await mysql.createConnection({
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD
});
 
await db.query(`CREATE DATABASE IF NOT EXISTS \$${database}\;`);
 
await db.end();
const sequelize = new Sequelize(process.env.DBNAME,process.env.DBUSER,process.env.DBPASSWORD,{
dialect:'mysql',
host:process.env.DBHOST,
port:process.env.DBPORT,
});
module.exports = sequelize;

