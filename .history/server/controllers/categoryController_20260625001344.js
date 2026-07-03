const Category = require("../models/category");

module.exports.createCategory = async(req, res)=>{
try{
     const name = req.body.name;
     const color = req.body.color;
     const icon = req.body.icon;
     if(!name || !color|| !icon){
    return res.status(400).json({ message: "All fields are required" });

     }
     const Create = new Category({
        name, 
        color,
         icon
     });
     await create.save();
     res.status(200).json({message:"create it"});
}catch(err){
    res.status(500).json({message:"eeror in forming"});
}
}

module.exports.getCategories = async(req,res)=>{
     try{
        const category = await Category.find();
        res.status(200).json(category);

     }catch(err){
        res.status(500).json({message:"errror in get "});
     }
}
module.exports.getCategoryById = async(req, res)=>{
      const id = req.params.id;
      try{
        const category = await Category.findById(id);
res.status(200).json(category);

     }catch(err){
        res.status(500).json({message:"errror in get by id"});
     }
    }


module.exports.updateCategory = async(req,res)=>{
 const id = req.params.id;
      try{
        const category = await category.findByIdAndUpdate(id);
res.status(200).json({message:"find successfull update"});

     }catch(err){
        res.status(500).json({message:"errror in update "});
     }
}

module.exports.DeleteCategory = async(req ,res)=>{
const id = req.params.id;
      try{
        const category = await category.findByIdAndDelete(id);
res.status(200).json({message:"find successful delete"});

     }catch(err){
        res.status(500).json({message:"errror in delete "});
     }
}