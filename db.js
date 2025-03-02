const mongoose = require('mongoose');
const mongoURI = "mongodb://0.0.0.0:27017/Barber";

const connectToMongo = async () => {
    mongoose.connect(mongoURI).then(()=>console.log("Connected Sucessfully")).catch((e)=>console.log(e.message))
};

module.exports  = connectToMongo;
