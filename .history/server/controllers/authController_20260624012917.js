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

 module.exports.getProfile = async (req,res,next)=>{

 }