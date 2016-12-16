var express = require("express");
var router = express.Router();
var user = require('../models/user.js');
var activeUsers={};

router.get('/userInfo',function(request,response){
   user.find({}, function(err, users) {
         if (err) { response.send(err); }
         if (!users) { response.json({users:"No information available"}); }
         response.json(users);
       });
});

router.get('/activeUsers',function(request,response){
    response.json(activeUsers);
});

router.post('/login',function(request,response){
  
   var userid=request.body.loginname;
   var password=request.body.password;
   console.log(userid+" "+password);
   user.find({userId:userid}, function(err, userData) {
         console.log(userData);
         if (err) { response.send(err); }
         if (!userData || userData.length === 0 || userData[0].password !== password)
             { response.json({res:false}); }
         else
             {
                 request.session.userData=userData[0];
                 activeUsers[userData[0].userId]=userData[0].userName;
                 response.json({res:true});}   
       });
});

router.post('/logout',function(request,response){
  
   console.log("logout...");
   delete activeUsers[request.session.userData.userId];
   request.session.destroy(function(err) {
       if(err){
           response.send(err);
       }else{
           response.json({res:true});
       }
   });

   user.find({userId:userid}, function(err, userData) {
         console.log(userData);
         if (err) { response.send(err); }
         if (!userData || userData.length === 0 || userData[0].password !== password)
             { response.json({res:false}); }
         else
             {
                 request.session.userData=userData[0];
                 response.json({res:true});}   
       });
});

module.exports=router;