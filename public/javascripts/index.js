//const socket=io();
function deletePost(id,no){

  $.ajax({
   
    url: `http://localhost:3000/post/delete/${id}`,
    context: document.body,
    method:"GET",
   // data: {id:id}   
}).then(function (data){
    console.log(data);
    
    if(data.status=='fail'){
      window.location=data.url;
    }
    else{
      if(data.role=='Manager'){
        console.log('managerr');
    socket.emit('sendDeletedNotification',{msg:'Youre post has been deleted by ADMIN',to:data.name})
      }
    $(`#${no}`).slideToggle("slow");
    }

  
});
}
function editPost(id,no){

  $.ajax({
   
    url: `http://localhost:3000/post/edit/${id}`,
    context: document.body,
    method:"GET",
   // data: {id:id}   
}).then(function (data){
    console.log(data);
    if(data.status=='fail'){
      window.location=data.url;
    }
    
    //location.reload();
   // ('#delete').load()
  
});
}



function createPost(id){
  console.log(id)
  window.location.href=`http://localhost:3000/home/create/${id}`;

}

 

function scrolltoTop(){
  $('html, body').animate({scrollTop:0}, '300');
}

  function likeUnlike(no,id,name) {
    
   // var no= parseInt(no)
   // var id=$(this).data('id');
    var data={
      id:id,
      uname:name
    };
    var ans=parseInt(document.getElementById(`result+${no}`).innerText);
   // console.log(id);
    var text=document.getElementById(`text+${no}`).innerText;
     
    if(text=="Like"){
      console.log(text)
      $.ajax({
              url: 'http://localhost:3000/post/like',
              data: data,
              method: 'PUT'
            }).then(function (response) {
              //console.log('responsee');
             // console.log(response);
              document.getElementById(`result+${no}`).innerText=ans+1;
              document.getElementById(`like-unlike-img+${no}`).src="/images/like1.png";
             document.getElementById(`text+${no}`).innerText="Unlike"
           
            }).catch(function (err) {
            
              console.error(err);
            });
    }
    else{
    //  console.log(text)
      $.ajax({
        url: 'http://localhost:3000/post/unlike',
        data: data,
        method: 'PUT'
      }).then(function (response) {
        //console.log(response);
       // console.log('responsee');
        document.getElementById(`result+${no}`).innerText=ans-1;
              document.getElementById(`like-unlike-img+${no}`).src="/images/like(1).png";
             document.getElementById(`text+${no}`).innerText="Like"
      }).catch(function (err) {
      //  console.log("eror")
        console.error(err);
      });
    }
    
  }
 
  function deleteTag(count){
    let d = document.getElementById("tag");
let d_nested = document.getElementById(`tag${count}`);
let throwawayNode = d.removeChild(d_nested);
  
  }

$('#submit').on('click',(event)=>{
  event.preventDefault();
  
  var email=$('#email').val();
  var password=$('#password').val();

 var data={
    email:email,
    password:password
  }
  console.log(data);
  $.ajax({
   url:'http://localhost:3000/login',
   data:data,
   method:'POST'
  }).then((response)=>{
    localStorage.setItem('req',response.req);
    localStorage.setItem('noti',response.noti);
    window.location.href='http://localhost:3000/home'
  })
})
  $('#addTag').on('click',(event)=>{
    event.preventDefault();
    var tag=document.getElementById("input-tag").value;
    var count=document.getElementById("tag").children.length;
    //alert(tag);
    console.log(count);
    $('#tag').append(`<span id="tag${count}" class="border border-dark p-1 m-1">#${tag}<img src='/images/delete.png' id='deleteTag${count}' onclick='deleteTag(${count})' width="10" height="10" style="cursor: pointer; margin-left:5px  "/></span>`)
    document.getElementById("input-tag").value='';
  })

  
  $('#createPost').on('click',(event)=>{
   
   var title=document.getElementById("inputTitle").value;
   var myContent = tinymce.get("inputText").getContent();
   var father = document.getElementById("tag");
var sons = father.children;

   var tags=[];
   for(var i=0;i<sons.length;i++){
    var child = sons[i];
    tags.push(child.innerText);
   }
  var data={
     title:title,
     tags:tags,
     text:myContent
   }

   $.ajax({
    url: 'http://localhost:3000/post/submit',
    data: data,
    method: 'POST'
  }).then(function (response) {
    //console.log(response);
   window.location.href='http://localhost:3000/home';
  }).catch(function (err) {
  //  console.log("eror")
    console.error(err);
  });
  })

  function viewPost(data){
    console.log(data);
  }

  function clearLocalStorage(){
    
    window.localStorage.clear();
  }

  function clearNotifications(){
    document.getElementById('notificationsCount').innerText='0';
    localStorage.setItem('noti','0');
    window.location.href='http://localhost:3000/user/clearNotifications'
  }
  
  // ajax jquery mongodb expressjs nodejs socket.io ejs tinymc amazon-s3 jwt bootstrap

  function changeDeptBtn(ele){
    console.log('1');
    $('#buttonDept').text(ele.innerText);
  }

  function changeSortBtn(ele){
    console.log('2');

    $('#button-order').text(ele.innerText);
  }

  function sortUsers(ele){
   

    var dept=$('#buttonDept').text().trim();
    var order=$('#button-order').text().trim();
    if(order=='Score') order='score';
    else if(order=='No of Posts') order='noPosts'
    else if(order=='Username') order='username'

    window.location.href=`http://localhost:3000/users/sortBy?dept=${dept}&order=${order}`
    if(order=='No of Posts') order='Posts';
   
   
  }

  function searchTag(){
    var tag=$('#inputTag').val();
  //  alert(tag);
    window.location.href=`http://localhost:3000/posts/searchTag/${tag}`
  }