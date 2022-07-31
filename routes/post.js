const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const dbConnect =  dbo.getDb();
var {ObjectId} = require('mongodb');
const { verifyToken } = require('../middleware/authJWT');



const authorizeUser=(req,res,next)=>{
//  console.log('hello');
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

const checkUser= async(req,res,next)=>{
 
    try{
     var result= await dbConnect.collection('blogs_data').findOne({_id:ObjectId(req.params.id)},{"userId":1})
      if(result.userId!==req.session.uid){
    // console.log(result);

        req.uid=result.userId;
        req.name=result.name;
        req.skipMiddleware=false;
       // console.log(req);
       // res.redirect('/posts')
      return next();
      }
      else {
       // console.log('skip');
        req.skipMiddleware=true;
       return next();
      }
    }
    catch{
     res.status(404).send('error');
    }  
  }

router.get('/create',authorizeUser,(req,res)=>{res.render('create_post');})

router.post('/submit',authorizeUser,async (req,res,next)=>{
    const data={
      userId:req.session.uid,
      name:req.session.name,
      title:req.body.title,
      text:req.body.text,
      likes:[],
      noLikes:0,
      tags:req.body.tags
    }
    
    try{
    await dbConnect.collection('blogs_data').insertOne(data);
    await dbConnect.collection('jwt_data').updateOne({_id:ObjectId(req.session.uid)},{$inc:{noPosts:1,score:50}})
      res.redirect('/home');
    }
    catch{
      res.status(400).send('Error inserting matches!');
    }
     
  })

  router.post('/submit_edit/:id',authorizeUser,async(req,res)=>{
    const query = { _id: ObjectId(req.params.id) };
    const updates = {
      $set: {
        title:req.body.title,
        text:req.body.text
      }
    };
  try{
   await dbConnect.collection('blogs_data').updateOne(query,updates);
      res.redirect('/view_posts');
    }
    catch{
      res.status(400).send('Error while submitting the post');
    }
  })

 

   router.get('/:id',authorizeUser,async(req,res)=>{

    try{
   var result = await dbConnect.collection('blogs_data').findOne({_id:ObjectId(req.params.id)})
      var isLike=true;
        
      if(result.likes.includes(req.session.uid))
      isLike=true;
      else 
      isLike=false;
    //console.log(result);
    res.render('view_post',{data : result,Like:isLike});
    }
    catch{
      res.status(400).send('Error fetching listings!');
    }
    })

    router.get('/edit/:id',authorizeUser,checkUser,verifyToken,async(req,res)=>{
      console.log('edit');
 
        try{
        var result= await  dbConnect.collection('blogs_data').findOne({_id:ObjectId(req.params.id)})
          res.render('edit_post',{data:result})
        }
        catch{
         res.status(404).send('error');
        }
      })

      router.get('/delete/:id',authorizeUser,checkUser,verifyToken,async(req,res)=>{
       console.log('roter');
        try{
          var condition;
          if(!req.skipMiddleware){
            
        // var result=await dbConnect.collection('blogs_data').findOne({_id:ObjectId(req.params.id)});
         condition={
          _id:ObjectId(req.uid)
         }
          }
          else{
            condition={
              _id:ObjectId(req.session.uid)
             }
          }
         
       await dbConnect.collection('jwt_data').updateOne(condition,{$pull:{posts:req.params.id}},{$inc:{noPosts:-1}},{$inc:{score:-50}});

        const listingQuery = { _id: ObjectId(req.params.id) };
       await dbConnect.collection('blogs_data').deleteOne(listingQuery);
       if(!req.skipMiddleware){
         console.log('here');
       res.json({status:'success1',url:'/posts',role:'Manager',name:req.name})
       }
       else {
        console.log('here2');
       res.json({status:'success2',url:'/posts',role:'user'})
       }
        }
        catch{
          res.send(`Error deleting `);
        }
      })

      router.put('/like',authorizeUser,async(req,res)=>{
        console.log(req.body);
        try{
       await dbConnect.collection('jwt_data').updateOne({Userame:req.body.uname},{$inc:{score:10}});
       await dbConnect.collection('blogs_data').updateOne({_id:ObjectId(req.body.id)},{$push:{likes:req.session.uid},$inc:{noLikes:1}});
       res.json({status:'success'})
      }
      catch{
        res.status(404).send('Error');
      }
      })
      router.put('/unlike',authorizeUser,async(req,res)=>{
        console.log(req.body);
        try{
       await  dbConnect.collection('jwt_data').updateOne({Userame:req.body.uname},{$inc:{score:-10}});
       await  dbConnect.collection('blogs_data').updateOne({_id:ObjectId(req.body.id)},{$pull:{likes:req.session.uid},$inc:{noLikes:-1}});
       res.json({status:'success'})
        }
        catch{
          res.status(404).send('Error');
        }
       })

module.exports = router;