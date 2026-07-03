const jwt = require("jsonwebtoken");
const User = require("../models/User");





module.exports.auth = (req,res,next)=>{
   let token = req.headers.authorization;
   if(!token){

    return res.status(401).json({message:"error"})
   }
   next();
  try{
    const decode = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decode.id,select("password"));


    next();

  }catch(err){
    res.status(401).json({message:"not acceses"});
  }
}