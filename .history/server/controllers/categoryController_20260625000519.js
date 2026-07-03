const category = require("../models/category");

module.exports.createCategory = async(req, res)=>{
try{
     const name = req.body.name;
     const color = req.body.color;
     const icon = req.body.icon;
     if(!name || !color|| !icon){
    return res.status(400).json({ message: "All fields are required" });

     }
     const create = new create({
        name, color, icon
     })
     await create.save();
     res.status(200).json({message:"create it"});
}catch(err){
    res.status(500).json({message:"eeror in forming"});
}
}

module.exports.getCategories = async(req,res)=>{

}
module.exports.getCategoryById = async(req, res)=>{

}
module.exports.updateCategory = async(req,res)=>{

}

module.exports.DeleteCategory = async(req ,res)=>{

}