const jwt = require("jsonwebtoken");
const User = require("../models/User");





module.exports.Islogin = (req,res,next)=>{
    (!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must logged in continue ");
        return res.redirect("loginUser")
    }
}