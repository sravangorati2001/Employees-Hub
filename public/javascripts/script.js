const socket=io();


function reqCount(count){

}
function notiCount(count){

}

const name=document.getElementById('currentUser').innerText.trim();
    console.log(name);
    socket.emit('join', {userId:name});

  



function sendFriendRequest(ele){
  var ele=document.getElementById('requestsCount');
 var count=parseInt(ele.innerText);
  var buttonEle=document.getElementById('friendButton');
  var recieverName=$(buttonEle).data('id');
  var buttonText=buttonEle.innerText.trim();
 // console.log(buttonText);
  if(buttonText==='Add Friend'){
  buttonEle.innerText='Sent Request';
  socket.emit('sendRequest',{from:name,to:recieverName,count:count});
  }
  else if(buttonText==='Sent Request'){
    buttonEle.innerText='Add Friend';
    socket.emit('removeRequest',{from:name,to:recieverName,count:count});
  }
  else if(buttonText==='Remove Friend'){
    console.log('hello');
    buttonEle.innerText='Add Friend';
    socket.emit('removeFriend',{from:name,to:recieverName,count:count});
  }
  else{
    
  }
}

function acceptRequest(recieverName,id){
  console.log('#acceptDiv'+`${id}`)
  $('#acceptDiv'+`${id}`).slideToggle();
  
 var count=parseInt(localStorage.getItem('req'));
  count=count -1;
  var reqEle=document.getElementById('requestsCount');
 
  if(count===0)
  reqEle.style.visibility='hidden'
  reqEle.innerText=count+'';

  localStorage.setItem('req',count);
 
  socket.emit('acceptRequest',{from:name,to:recieverName});
  
//  console.log(count);
if(count)
  ele.innerText=count;
  else
  ele.style.display='none';
}

socket.on('recieveRequest',(data)=>{
  
 var count=parseInt(localStorage.getItem('noti'));
  count=count +1;
  var notiEle= document.getElementById('notificationsCount');
  notiEle.innerText=count+'';
  notiEle.style.visibility='visible'
  localStorage.setItem('noti',count);
  
  var count=parseInt(localStorage.getItem('req'));
  count=count +1;
  var reqEle=document.getElementById('requestsCount');
 
  if(count!==0)
  reqEle.style.visibility='visible'
  reqEle.innerText=count+'';

  localStorage.setItem('req',count);
 
  Toastify({

    text: `${data.sender} wants to connect `,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
      
    },
    offset: {
      x: 30, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 60 // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    close:true,
    destination:'http://localhost:3000/user/friendRequests',
    newWindow:true,
    duration: 6000
    }).showToast();
})

socket.on('recieveFriendAdded',(data)=>{
  var count=parseInt(localStorage.getItem('noti'));
  count=count +1;
  var notiEle= document.getElementById('notificationsCount');
  notiEle.innerText=count+'';
  notiEle.style.visibility='visible'
  localStorage.setItem('noti',count);
 
   Toastify({

    text: `${data.sender} accepted you're connection request`,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    offset: {
      x: 30, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 60 // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    close:true,
    destination:'http://localhost:3000/user/notifications',
    newWindow:true,
    duration: 6000
    }).showToast();
})

function sendMessage(recieverName){
  let person = prompt("Please enter your message");
 // console.log(person);
  if(person.length){
// console.log('hello');
    
    socket.emit('sendMessage',{from:name,to:recieverName,msg:person})
  }
}
socket.on('recieveMessage',(data)=>{
  var count=parseInt(localStorage.getItem('noti'));
  count=count+1;
  var notiEle= document.getElementById('notificationsCount');
  notiEle.innerText=count+'';
  notiEle.style.visibility='visible'
  localStorage.setItem('noti',count);

  Toastify({
    text: data.msg+`  :  ${data.sender}`,
    style: {
      
      background: "linear-gradient(to right, #141e30, #243b55)",
    },
    offset: {
      x: 30, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 60 // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    close:true,
    destination:'http://localhost:3000/user/notifications',
    newWindow:true,
    duration: 6000
    }).showToast();
})

socket.on('recieveDeletedNotification',(data)=>{
  var count=parseInt(localStorage.getItem('noti'));
  count=count +1;
  var notiEle= document.getElementById('notificationsCount');
  notiEle.innerText=count+'';
  notiEle.style.visibility='visible'
  localStorage.setItem('noti',count);

  Toastify({

    text: data.msg,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    offset: {
      x: 30, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 60 // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    close:true,
    destination:'http://localhost:3000/user/notifications',
    newWindow:true,
    duration: 6000
    }).showToast();
})
