const express=require("express");
const { default: mongoose } = require("mongoose");
const app=express();
const path = require('path');


app.get("/",(req,res)=>{
//res.send("<h1>hello from express</h1>");
res.sendFile(path.join(__dirname+'/index.html'));
//res.sendFile('index.html');
});
app.get("/resJson",(req,res)=>{
    res.send([{
        Roll:18,
        name:"charan"
    },
    {
        Roll:520,
        name:"RAM"
    }
]);
    });

app.listen(4000,()=>{
 console.log("Iam from 3000 port");
});
