const { model } = require("mongoose");
const mongoose = require("moongoose");
const   Schema = moongoose.Schema;


const categorySchema = new Schema({
 
    name:{
        type:String,
        required:true,
        unique:true,
    },
    color:{
       type:String,
       required:true,
    },
    icon:{
        type:String,
        required:true,
    }
   
});
module.exports = moongoose.model("Category",categorySchema);