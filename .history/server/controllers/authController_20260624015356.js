
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
const perfectPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

export function registerUser(req,res,next) {
    try{
         const name = req.body.name;
         const email = req.body.email;
         const password = req.body.password;
if(!name || email || password){
    
     res.status(400).json({
        message:"all field are required",
     });
}

 const user = await User.findOne({ email });
          if(!email  ||!perfectPasswordRegex(password)){
              return res.status(400).json({
                message:"inavild credetional"
              }); 
          }
          const hashedpassowrd =bcrypt.hash(password,12);

  const user =  new User({
    name,
    email,
    password:hashedpassowrd,
  });
  await user.save();
  res.status(201).json({
    message:"registered successfull"
  });
}catch(err){
    res.status(400).json({
        message:err.message,
    })
}
  

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
   res.status(200).json({
    message:"logout"
   })
 }