const User = require("../models/user.js");

module.exports.sign =(req,res)=>{
    res.render("user/signup")
}
module.exports.signup = async(req,res,next)=>{
    try{
        const {username,email,password} = req.body;
        const Newuser = new User({username,email});
        const registerUser = await User.register(Newuser,password);

        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","login to expense tracker");
            res.redirect("/dd");

        });
    }catch(err){
        req.flash("error","err.message");
        res.redirect("/simngup")
    }
}