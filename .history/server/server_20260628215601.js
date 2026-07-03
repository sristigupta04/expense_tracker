require("dotenv").config();


const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("connect-flash");
const Userroute = require("./routes/authRoute");
const { model } = require("mongoose");
const User = require("./model/user.js");


const app = express();
const port = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb";


async function main() {
    
}