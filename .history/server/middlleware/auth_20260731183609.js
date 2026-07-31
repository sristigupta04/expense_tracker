const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decode.id).select("-password");

    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};