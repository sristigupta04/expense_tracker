const jwt = require("jsonwebtoken");
const User = require("../models/User");





module.exports.auth = (req,res,next)=>{
   let token = req.headers.authorization;
   if(!token){
    return res.status(401).json({message:"error"})
   }
   next();
}