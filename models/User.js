const mongoose = require('mongoose');
const {Schema}=mongoose;
const LogSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        match: [/\S+@\S+\.\S+/, "Please enter a valid email"], 

    },
    password:{
        type:String,
        required:true
    }
  });
  const User = mongoose.model('user',LogSchema);
  User.createIndexes();
  module.exports=User