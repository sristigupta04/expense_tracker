const mongoose = require("mongoose")
const Schema = mongoose.Schema;
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

   },

   password:{
      type:Number,
    required:true,
    unique:true
   }
});

userschema.plugin(passportLocalMongoose);
const User = mongoose.model("User","userschema")
module.exports =User;
