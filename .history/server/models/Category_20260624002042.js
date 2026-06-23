const { model } = require("mongoose");
const mongoose = require("moongoose");
const schema = moongoose.Schema;


const categorySchema = new Schema({
   category:{
    food = {
        name:"food",
        color:"green",
        icon:"##",
    },
    travel ={
        name:"travel",
        color:"blue",
        icon:"##",
    }
    shopping ={
        name:"shop",
        color:"red",
        icon:"##",
    }
   }
});
module.exports = moongoose.model("Category","categorySchema");