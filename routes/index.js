var express = require("express");
var router = express.Router();

router.get('/',function(request,response){
    console.log("Request arrived in /");
    response.render('index.html');
});

router.get('/chatting',function(request,response){
    console.log("Request arrived in /chatting");
    response.redirect('/');
});

router.get('/login',function(request,response){
    console.log("Request arrived in /login");
    response.redirect('/');
});

module.exports=router;