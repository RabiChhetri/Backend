const mongoose = require('mongoose');
const {Schema}=mongoose;
const SignSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
  });
  const SignUser=mongoose.model('Sign',SignSchema);
//   SignUser.createIndexes();
  module.exports=SignUser;