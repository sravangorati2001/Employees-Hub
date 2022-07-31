#!/usr/bin/env node

/**
 * Module dependencies.
 */

 var app = require('../app');
 var debug = require('debug')('express:server');
 var http = require('http');
 const dbo=require('../db/conn');

 // var jsdom = require("jsdom");
 // const { JSDOM } = jsdom;
 // const { window } = new JSDOM();
 // const { document } = (new JSDOM('')).window;
 // global.document = document;
 
 // var $ = jQuery = require('jquery')(window);
 // const { debuglog } = require('util');
 
 /**
  * Get port from environment and store in Express.
  */
 
 var port = normalizePort(process.env.PORT || '3000');
 app.set('port', port);
 
 /**
  * Create HTTP server.
  */
 
 var server = http.createServer(app);
 
 //const server=require('./bin/www')

 //var io = require('socket.io')(http.Server(app));
 //console.log(server)

 const io = require('socket.io')(server);
 io.on('connection',socket =>{
  //console.log(socket.id)
  // socket.emit('message',"welcome to Dbox studio")
  socket.on('join', function (data) {  
   // console.log(data);  
    socket.join(data.userId);
   
  });
  


socket.on('sendRequest',async(data)=>{
  const dbConnect =  dbo.getDb();
 await dbConnect.collection('jwt_data').updateOne({Userame:data.to},{$push:{requests:data.from}});
    io.sockets.in(data.to).emit('recieveRequest',{sender:data.from,reciever:data.to});
   
})
socket.on('acceptRequest',async(data)=>{
  var noti=data.from+"accepted you're friend request"

  const dbConnect =  dbo.getDb();
 await dbConnect.collection('jwt_data').updateOne({Userame:data.from},{$push:{friends:data.to},$pull:{requests:data.to}});
  await  dbConnect.collection('jwt_data').updateOne({Userame:data.to},{$push:{friends:data.from}},{$push:{notifications:noti}});
    io.sockets.in(data.to).emit('recieveFriendAdded',{sender:data.from,reciever:data.to});

})

socket.on('sendMessage',async(data)=>{
  var msg=data.msg
 // console.log(data);
  const dbConnect =  dbo.getDb();
  await dbConnect.collection('jwt_data').updateOne({Userame:data.to},{$push:{notifications:msg}});
    io.sockets.in(data.to).emit('recieveMessage',{sender:data.from,reciever:data.to,msg:data.msg});
})

socket.on('removeRequest',async(data)=>{
 // console.log(data);
  const dbConnect =  dbo.getDb();
 await dbConnect.collection('jwt_data').updateOne({Userame:data.to},{$pull:{requests:data.from}});
})

socket.on('removeFriend',async(data)=>{
  const dbConnect =  dbo.getDb();
 await dbConnect.collection('jwt_data').updateOne({Userame:data.from},{$pull:{friends:data.to}});
   await dbConnect.collection('jwt_data').updateOne({Userame:data.to},{$pull:{friends:data.from}});
    io.sockets.in(data.to).emit('recieveRequest',{sender:data.from,reciever:data.to});

})

socket.on('sendDeletedNotification',async(data)=>{
  console.log('socket');
  const dbConnect =  dbo.getDb();
  var msg=data.msg;
 await dbConnect.collection('jwt_data').updateOne({Userame:data.to},{$push:{notifications:msg}})
  io.sockets.in(data.to).emit('recieveDeletedNotification',{msg:data.msg})
})

})
 /**
  * Listen on provided port, on all network interfaces.
  */
 dbo.connectToServer(function(err)
 {
   if(err){
     console.error(err);
     process.exit();
   }
   server.listen(port);
 })
 
 server.on('error', onError);
 server.on('listening', onListening);
 
 /**
  * Normalize a port into a number, string, or false.
  */
 
 function normalizePort(val) {
   var port = parseInt(val, 10);
 
   if (isNaN(port)) {
     // named pipe
     return val;
   }
 
   if (port >= 0) {
     // port number
     return port;
   }
 
   return false;
 }
 
 /**
  * Event listener for HTTP server "error" event.
  */
 
 function onError(error) {
   if (error.syscall !== 'listen') {
     throw error;
   }
 
   var bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;
 
   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }
 
 /**
  * Event listener for HTTP server "listening" event.
  */
 
 function onListening() {
   var addr = server.address();
   var bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr.port;
   debug('Listening on ' + bind);
 }
 
//module.exports=server;