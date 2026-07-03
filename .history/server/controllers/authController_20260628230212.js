
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
const perfectPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

module.exports.registerUser= async(req,res,next) =>{
    try{
         const name = req.body.name;
         const email = req.body.email;
         const password = req.body.password;
if(!name || !email || !password){
    
     res.status(400).json({
        message:"all field are required",
     });
}

 const existinguser = await User.findOne({ email });
          if(!perfectPasswordRegex.test(password)){
              return res.status(400).json({
                message:" weak  password"
              }); 
          }
          const hashedpassowrd =bcrypt.hash(password,12);
 const user =  new User({
    name,
    email,
    password:hashedpassowrd,
  });
  
  await user.save();
  if(existinguser){
  res.status(201).json({
    message:"registered successfull"
  });
}
}catch(err){
    res.status(400).json({
        message:err.message,
    })
}
 

}
 module.exports.loginUser= async (req,res,next)=>{
    try{
const {email,password} = req.body;
        if(!email  || ! password){
           return res.status(400).json({
            message:"all the fields are required"
           })
        }
        
          const user = await User.findOne({ email });
          if(!email  ||!perfectPasswordRegex(password)){
              return res.status(400).json({
                message:"inavild credetional"
              }); 
          }
          const match =await  bcrypt.compare(password,user.password);
          if(!match){
            res.status(400).json({
                message:"invaild"
            });
          }
  res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });        
        
        }catch(err){
        res.status(500).json({message:err.message});
        }
    }
    

 module.exports.getProfile = async(req,res,next)=>{
    try{

    if(!user){
        const user = await User.findById(req.user.id);
      res.status(200).json({message:"user"})
    }
 }catch(err){
    res.status(500).json({message:"err.message"});
 }
}
 module.exports.logoutUser = async(req,res,next)=>{
   res.status(200).json({
    message:"logout"
   })
 }
