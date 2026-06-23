const moongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/client";

main().then(()=>{
console.log("successufull connect")
})
.catch((err)=>{
    console.error("error found");
})

async function main() {
     await moongoose.connect(MONGO_URL);
}

