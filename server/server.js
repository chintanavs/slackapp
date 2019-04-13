const path=require('path');
const express=require('express');
const socketIO=require('socket.io');
const http=require('http')


const {generateMessage,generateLocationMessage}=require('./utils/message');
//path.join is used to omit the relative path
const publicPath=path.join(__dirname,'../public');
var port=process.env.PORT || 3000;
var {isRealString}=require('./utils/validation.js');
var {Users}=require('./utils/users.js');
var app=express();
var server=http.createServer(app);
var io=socketIO(server);

var users=new Users();


//use to define the middleware
app.use(express.static(publicPath));


//used to set up a new connection
io.on('connection',(socket)=>{
  console.log('new user connected');

//use to define our own events
// socket.emit('newMessage',{
//   from:'Andrew',
//   body:'I am sending this from server side',
//   createdAt:Date().toString()
// });




socket.on('join',(params,callback)=>{
  if(!isRealString(params.name) || !isRealString(params.room)){
    return callback('Name and Room are required!');
  }
  socket.join(params.room);
  users.removeUser(socket.id);
  users.addUser(socket.id,params.name,params.room);


  io.to(params.room).emit('updateUserList',users.getUserList(params.room));
  //greating the new User
  socket.emit('newMessage',generateMessage('Admin','Welcome to the chat!'));

  //notifying other users that the new user has joined the chat room
  socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',params.name +' has joined'));
  callback();
});


socket.on('createMessage',(message,callback)=>{
  //console.log(message);
  var user=users.getUser(socket.id);
  if(user && isRealString(message.text)){
    io.to(user.room).emit('newMessage',generateMessage(user.name,message.text));
  }

  callback();
});

socket.on('createLocationMessage',(coords)=>{
  var user=users.getUser(socket.id);
  if(user){
    io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude,coords.longitude));
  }
});

socket.on('disconnect',()=>{
  var user=users.removeUser(socket.id);
  if(user){
    io.to(user.room).emit('updateUserList',users.getUserList(user.room));
    io.to(user.room).emit('newMessage',generateMessage('Admin',user.name+' has left the chat'));
  }
});

});

server.listen(port,()=>{
  console.log(`Server is up on port ${port}`);
});
