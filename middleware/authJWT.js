const jwt = require("jsonwebtoken");
const dbo = require('../db/conn');
const alert=require('alert')

exports.verifyToken = (req, res, next) => {
  if(req.skipMiddleware){
    return next();
  }
    const dbConnect = dbo.getDb();
  console.log(req.cookies);
  console.log('token');

  if (req.cookies && req.cookies['jwtt']) {
    jwt.verify(req.cookies['jwtt'], process.env.API_SECRET, function (err, decode) {
     console.log(decode);
     if(decode.role=='Manager'){
     req.uid=decode.uid;
     return next();
     }
     else{
      console.log('hellooooo');
      alert('you cant edit/delete post')
      // res.redirect('/home')
      res.json({status:'fail',url:'/posts'})
     }
    });
  } else {
    res.redirect('/signin')
  }
};
//module.exports = verifyToken;