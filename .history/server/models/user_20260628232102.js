const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const userschema = new Schema({
   
   name:{
    type:String,
    required:true,
        unique:true

   },
   email:{
    type:String,
    required:true,
    unique:true
   },
   number:{
    type:Number,
    required:true,

   },

   password:{
      type:Number,
    required:true,
   }
});

const User = mongoose.model("User","userschema")
module.exports =User;
