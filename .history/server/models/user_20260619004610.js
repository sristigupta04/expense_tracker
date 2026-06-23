const mongoose = require("mongoose")
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const { types } = require("pg");

const userschema = new Schema({
   email:{
    type:String,
    required:true,
    unique:true
   },
   name:{
    type:String,
    required:true,
    default:true
   },
   number:{
    type:Number,
    required:true,

   }
});

userschema.plugin(passportLocalMongoose);
const User = mongoose.model("User","userschema")
module.exports =User;
