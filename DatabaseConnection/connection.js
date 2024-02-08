const Sequelize=require('sequelize');
const dotenv=require('dotenv');
const mysql=require('mysql2/promise');
dotenv.config();
async function createDatabase() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DBHOST,
            port: process.env.DBPORT,
            user: process.env.DBUSER,
            password: process.env.DBPASSWORD
        });

        await db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DBNAME}`);

        await db.end();

        console.log('Database created successfully');
    } catch (error) {
        console.error('Error creating database:', error);
    }
}
const sequelize = new Sequelize(process.env.DBNAME,process.env.DBUSER,process.env.DBPASSWORD,{
dialect:'mysql',
host:process.env.DBHOST,
port:process.env.DBPORT,
});
module.exports = sequelize;

