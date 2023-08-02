var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
//var User = require("../models/user");
const dbo = require('../db/conn');
const session=require('express-session')
const cookieParser=require('cookie-parser');
const Aws = require('aws-sdk')
require('dotenv').config()
var {ObjectId} = require('mongodb');

const app = require("../app");
var s3Func=require('../middleware/s3');

exports.signup = async(req, res,next) => {
  const dbConnect = dbo.getDb();
    console.log(req.body);
  const matchDocument = {
    Userame: req.body.name,
    email: req.body.email,
    role: req.body.role,
    department:req.body.department,
    password: bcrypt.hashSync(req.body.password, 8),
    score:0,
    notifications:[],
    noPosts:0,
    friends:[],
    requests:[]
  };
  await dbConnect.collection('jwt_data').insertOne(matchDocument);
    next();
};

exports.signin = async (req, res,next) => {
  
  const dbConnect = dbo.getDb();
    dbConnect
    .collection('jwt_data')
    .findOne({email: req.body.email},async (err, result)=>{
     if(err){
        res
        .status(400)
        .send(`Error while login`);
     }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        result.password
      );
      if (!passwordIsValid) {
        return res.status(401)
          .send({
            accessToken: null,
            message: "Invalid Password!"
          });
      }

      //signing token with user id
      var token = jwt.sign({
        uid: result._id,
        role:result.role
      }, process.env.API_SECRET, {
        expiresIn: 86400
      });
      req.session.isAuth=true;
      req.session.name=result.Userame;
      res.cookie("jwtt",token,{
        expires:new Date(Date.now()+ 100000),
        httpOnly:true
      })
   
      var url ='';
     req.session.url=url;
     req.session.requestCount=result.requests.length;
     req.session.notificationCount=result.notifications.length;
   
     
      req.session.name=''
     


 req.session.uid=(result._id);
      res.json({req:result.requests.length,noti:result.notifications.length,status:'success'});
     // res.redirect('http://localhost:3000/home')
    });
};
