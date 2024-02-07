const {DataTypes}= require('sequelize');
const sequelize =require('../DatabaseConnection/connection.js');

// defining user model here 
const User=sequelize.define('User', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    first_name:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true,
            isAlpha:{
                msg:"Letters only allowed in First Name",
            }
        },
    },
   last_name:{
    type:DataTypes.STRING,
    allowNull:false,
    validate:{
        notEmpty:true,
        isAlpha:{
            msg:"Letters only allowed in Last Name",
        }
    },
   },
   password:{
    type:DataTypes.STRING,
    allowNull:false,
    validate:{
        notEmpty:true,
        
        
    }
   },
   username:{
    type:DataTypes.STRING,
    allowNull:false,
    unique: true,
    validate:{
        notEmpty:true,
        isEmail:{
            msg:"Invalid Email Given"
        },
    },
   },
},
{
    timestamps:true,
    createdAt:'account_created',
    updatedAt:'account_updated',
});

module.exports=User;