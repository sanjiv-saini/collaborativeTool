var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var userSchema=new Schema({userId:String,userName:String,password:String,groupIds:[String]});
var userModel=mongoose.model('user',userSchema,'users');
//1st is name 2nd is schema
//3rd param is name of mongo collection
module.exports=userModel;

