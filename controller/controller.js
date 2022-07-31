const express = require('express');

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require('../db/conn');


exports.create = async (req,res)=>{
  const dbConnect = dbo.getDb();
    //console.log("hello")
    const matchDocument = {
        name: req.body.name,
        email: req.body.email,
        department: req.body.department
      };
     // console.log(matchDocument);
    
      dbConnect
        .collection('listingsAndReviews')
        .insertOne(matchDocument, function (err, result) {
          if (err) {
            res.status(400).send('Error inserting matches!');
          } else {
            console.log(`Added a new match with id ${result.insertedId}`);
            //res.status(204).send();
           
            //res.redirect("/");
            res.send("addedddd")
          }
        });
}

exports.view = async (req,res)=>{
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('listingsAndReviews')
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching listings!');
      } else {
        res.json(result);
      }
    });
}
exports.update= async (req,res)=>{
  const dbConnect = dbo.getDb();
  const listingQuery = { _id: req.body.id };
  const updates = {
    $inc: {
      likes: 1,
    },
  };

  dbConnect
    .collection('listingsAndReviews')
    .updateOne(listingQuery, updates, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error updating likes on listing with id ${listingQuery.id}!`);
      } else {
        console.log('1 document updated');
      }
    });
}
exports.deletee=async (req,res)=>{
  const dbConnect = dbo.getDb();
  console.log(req.params.id)
  const listingQuery = { 'email': req.params.id };

  dbConnect
    .collection('listingsAndReviews')
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${listingQuery._id}!`);
      } else {
        //console.log('1 document deleted');
        //('#'+req.params.id).toggle()
      }
    });
}
