var express = require('express');
var router = express.Router();
var handler=require('../middleware/s3')
const dbo = require('../db/conn');
var {ObjectId} = require('mongodb');
const dbConnect =  dbo.getDb();



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



router.get('/profile/:id',authorizeUser,async(req,res)=>{
  
  
  try{
  var result= await dbConnect.collection('jwt_data').findOne({_id:ObjectId(req.params.id)})
    var url =await handler.getUrl(result.key);
     var data={
        name:result.Userame,
        email:result.email,
        url:url,
        count:result.friends.length,
        id:result._id
      }
      var isFriend=result.friends.includes(req.session.name);
      var sentRequest=result.requests.includes(req.session.name);
    res.render('profile',{user:data,isFriend:isFriend,sentRequest:sentRequest});
  }
  catch{
    res.status(400).send('Error');
  }
})

router.get('/friendRequests', authorizeUser,async (req,res)=>{
  try{
 var result= await dbConnect.collection('jwt_data').findOne({_id:(ObjectId(req.session.uid))},{ projection:{requests:1,_id:0}})
 console.log(result.requests);
  res.render('friendRequests',{req:result.requests})
}
  catch{
    res.status(400).send('Error');
  }
})

router.get('/notifications',authorizeUser,async(req,res)=>{
  try{
    var result= await dbConnect.collection('jwt_data').findOne({_id:(ObjectId(req.session.uid))},{ projection:{notifications:1,_id:0}})
   res.render('notification',{noti:result.notifications})
  }
  catch{
    res.status(400).send('Error');
  }

 })

 router.get('/clearNotifications',authorizeUser,async(req,res)=>{
  // req.session.notificationCount=0;
  await dbConnect.collection('jwt_data').updateOne({_id:ObjectId(req.session.uid)},{$set:{notifications:[]}})
  res.redirect('/user/notifications');
 })
 router.get('/ques/:id',authorizeUser,async(req,res)=>{
  try{
  var result= await  dbConnect.collection('questions').find({userId: (req.params.id)}).limit(50).toArray();
      res.render('view_ques',{data : result,name:req.session.name});
    }
    catch{
      res.status(400).send('Error fetching listings!');
    }
})

router.get('/likedPosts',authorizeUser,async (req,res)=>{

  var result;
  try{
  result= await dbConnect.collection('blogs_data').find({ likes:{$elemMatch:{$eq:req.session.uid}}}).limit(50).toArray()
  }
  catch{
   res.status(400).send('Error fetching users!');
  }
       var isLike=[];
       for(i=0;i<result.length;i++){
         var arr=result[i].likes
        // console.log(req.session.uid)
         if(arr.includes(req.session.uid))
         isLike[i]=true;
         else 
         isLike[i]=false;
       }
       res.render('view_posts',{users : result,Like:isLike});
     
 })

 router.get('/posts/:id',authorizeUser,async(req,res)=>{
    var condition;
    if(req.params.id=='my'){
    condition={
      userId: req.session.uid
    }
  }
    else{
      condition={
        userId: req.params.id
      }
    }

  try{
 var result = await dbConnect.collection('blogs_data').find(condition).limit(50).toArray()
    
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
});

router.get('/notifications',(req,res)=>{ res.render('notification'); })


module.exports = router;
