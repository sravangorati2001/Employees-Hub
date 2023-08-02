var express = require('express');
var router = express.Router();
var {signup,signin} = require("../controller/auth")
const dbo = require('../db/conn');
var path = require('path'); 
const alert=require('alert');
const multer = require('multer') 
const UPLOAD=multer();             
const Aws = require('aws-sdk')
var {verifyToken}=require('../middleware/authJWT')
var handler=require('../middleware/s3')
require('dotenv').config()
var cookieParser = require('cookie-parser');
var app = require('../app');
const session=require('express-session')
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand ,S3ClientConfig} = require("@aws-sdk/client-s3");
const S3 = require('aws-sdk/clients/s3')
const querystring = require('querystring');
const dbConnect=dbo.getDb();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('create', { title: 'Express' });
});
var {ObjectId} = require('mongodb');
const { render } = require('../app');



const isLogin=(req,res,next)=>{
  if(req.session.isAuth){
   
    res.redirect('/home')
  }
  else{
    next();
  }
}
router.get('/signup',isLogin,(req,res)=>{ res.render('signup'); })

router.get('/signin',isLogin,(req,res)=>{ res.render('signin'); })


router.get('/logout',(req,res)=>{
  res.clearCookie('jwtt', "", { expires: new Date() })
   req.session.destroy((err) => { 
     res.redirect('/signin') // will always fire after session is destroyed
   })
})

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'images')
  },
  filename: function (req, file, cb) {
    //console.log(file);
      cb(null, file.fieldname + '-' + Date.now())
  }
});

const upload = multer({ storage }).single('image');
router.post("/register",upload,signup,async (req,res)=>{
 await dbConnect.collection('jwt_data')
  .updateOne({email:req.body.email},{$set:{key:req.file.filename}})
 
 const file = req.file
//console.log(file)

res.render('signin');
});

router.post("/login",signin,(req,res)=>{

});

const authorizeUser=(req,res,next)=>{

  if(req.session.isAuth){
    res.locals.name=req.session.name;
    res.locals.url=req.session.url;
    
    next();
  }
  else{
   alert('Please login first');
    res.redirect('/signin')
  }
}



router.get('/profile',authorizeUser,(req,res)=>{
    
   res.render('myprofile')
})



router.get('/home',authorizeUser,(req,res)=>{
  console.log('hello');
   if(typeof req.session.flag === "undefined")
   req.session.flag=true;
   else
   req.session.flag=false;
  
  res.render('home',{flag:req.session.flag})
})


router.get('/users',authorizeUser,async(req,res)=>{
  var orderBtn="Default";
  var deptBtn='Default'
  var uid=ObjectId(req.session.uid)
  try{
 var result= await dbConnect.collection('jwt_data').find({_id:{$ne:uid}}).toArray()

  res.render('view',{users:result,orderBtn:orderBtn,deptBtn:deptBtn});
  }
  catch{
    res.status(400).send('Error fetching users!');
  }
})




const verifyUser= async(req,res,next)=>{
  try{
    var result= await dbConnect.collection('blogs_data').findOne({_id:ObjectId(req.params.id)},{"access":1})
    if(result.includes(req.query.dept)){
      next();
    }
    else{
      res.json({status:'pending'})
    }
  }
  catch{

  }
}

router.get('/users/sortBy',authorizeUser,verifyUser,async (req,res)=>{
 // console.log('hello');
  var sortCondition,findCondition;
  var deptBtn=req.query.dept;
  var orderBtn=req.query.order;
  var uid=ObjectId(req.session.uid)
//  console.log(req.query);
  if(deptBtn=='Default') findCondition={_id:{$ne:uid}}
  else{
    findCondition={
      department:deptBtn,
      _id:{$ne:uid}
    }
  }
  if(orderBtn=='score'){
     sortCondition={
      score:-1
    }
  }
  else if(orderBtn=='username'){
    sortCondition={
      Userame:1
    }
  }
  else if(orderBtn=='Default'){
sortCondition={}
  }
  else{
    sortCondition={
      noPosts:-1
    }
  }
 // console.log(findCondition,sortCondition);
 
  try{
  var data=await dbConnect.collection('jwt_data').find(findCondition).sort(sortCondition).limit(50).toArray()
  //console.log(data);
  res.render('view',{users:data,orderBtn:orderBtn,deptBtn:deptBtn});
  }
  catch{
    res.status(404).send('error');
  }
})

router.get('/posts/sortBy/:id',authorizeUser,async(req,res)=>{
  var condition;
  if(req.params.id=="1"){
    console.log("desc")
   condition={
     noLikes:-1
   }
  }
  else if(req.params.id=="2"){
    condition={
      noLikes:1
    }
  }
  else{
    condition={
      title:1
    }
  }
  try{
 var result= await dbConnect.collection('blogs_data').find({}).sort(condition).limit(50).toArray();

    var isLike=[];
      for(i=0;i<result.length;i++){
        var arr=result[i].likes
        if(arr.includes(req.session.uid))
        isLike[i]=true;
        else 
        isLike[i]=false;
      }
    res.render('view_posts',{users : result,Like:isLike});

  }
  catch{
    res.status(400).send('Error fetching listings!');
  }
})

router.get('/posts/searchTag/:id',authorizeUser,async(req,res,next)=>{
 console.log('hellooo');
  var tag='#'+req.params.id;
   try{
 var result= await dbConnect.collection('blogs_data').find({tags:{$elemMatch:{$eq:tag}}}).limit(50).toArray()
     var isLike=[];
         for(i=0;i<result.length;i++){
           var arr=result[i].likes
           if(arr.includes(req.session.uid))
           isLike[i]=true;
           else 
           isLike[i]=false;
         }
        // console.log(result);
         res.render('view_posts',{users : result,Like:isLike});
   }
   catch{
     res.status(400).send('Error fetching listings!');
   }
 })
router.get('/posts',authorizeUser,async(req,res,next)=>{

  try{
 var result=  await dbConnect.collection('blogs_data').find({}).limit(50).toArray();
   //  console.log(result);
      var isLike=[];
        for(i=0;i<result.length;i++){
         // result[i].text=result[i].text.substring(0,700);
          var arr=result[i].likes
          if(arr.includes(req.session.uid))
          isLike[i]=true;
          else 
          isLike[i]=false;
        }
      res.render('view_posts',{users : result,Like:isLike});
  
    }
    catch{
      res.status(400).send('Error fetching listings!');
    }
  
})



router.get('/questions',authorizeUser,async(req,res)=>{
  try{
    var result= await dbConnect.collection('questions').find({}).limit(50).toArray();
    res.render('view_ques',{data : result});
  }
  catch{
    res.status(400).send(`Error`);
  }
})

router.get('/temp',(req,res)=>{
  res.render('temp')
})





module.exports = router;