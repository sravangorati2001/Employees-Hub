const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const dbConnect =  dbo.getDb();
var {ObjectId} = require('mongodb');



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
  router.get('/write_ans/:id',authorizeUser,async (req,res)=>{
   
    try{
    var result= await  dbConnect.collection('questions').findOne({ _id:ObjectId(req.params.id)})
      res.render('write_ans',{ques:result.ques,id:result._id});
  
    }
    catch{
      res.status(400).send(`Error while login`);
    }
  })

  router.post('/submit_ans',authorizeUser,async(req,res)=>{
    try{
   await dbConnect.collection('questions').updateOne({_id:ObjectId(req.body.id)},{$push:{ans:req.body.ans}});
      res.redirect('/home');
    }
    catch{
      res.status(400).send(`Error`);
    }
  })

  router.post('/submit',authorizeUser,async(req,res)=>{
 
    const data={
      name:req.session.name,
      ques:req.body.ques,
      userId:req.session.uid,
      ans:[]
    }
    try{
   await dbConnect.collection('questions').insertOne(data);
      res.redirect('/home');
    }
    catch{
      res.status(400).send('Error inserting matches!');
    }
  })

  router.get('/answers/:id',authorizeUser,async(req,res)=>{
   try{
     var result= await dbConnect.collection('questions').findOne({_id:ObjectId(req.params.id)});
     
        res.render('view_ans',{ans:result.ans,ques:result.ques})
     }
      catch{
        res.status(400).send(`Error while login`);
      }
    })

    module.exports = router;