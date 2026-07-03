import { generatePath } from "react-router-dom";

const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

export function registerUser(req,res,next) {
         const name = req.body;
         const email = req.body;
         const password = req.body;
if(!name || email || password){
    
     res.status("error");
}
const perfectPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

 if(perfectPasswordRegex(password)){
    res.status("succes","you made a strong password")
 }else {
    res.status("password is not secured ")
 }
 res.redirect("registerUser");
  const user = await new User(
    name,
    email,
    password
  )
  User.save(User);
}

 module.exports.loginUser= async (req,res,next)=>{
const {email,password} = req.body;
        if(!email  || ! password){
           return res.status(400).json({
            message:"all the fields are required"
           })
        }
        try{
          const user = await User.findOne({ email });
          if(!email  ||!perfectPasswordRegex(password)){
              return res.status(400).json({
                message:"inavild credetional"
              }); 
          }
           res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
        }
 


 module.exports.getProfile = async(req,res,next)=>{
    if(!user){
      res.status(400).json({message:"invaild user"})
    }
    res.status(200).json({  id:user._id,
    user,
    token: generateToken(user._id),})
  
 }
 module.exports.logoutUser = async(req,res,next)=>{
    
 }