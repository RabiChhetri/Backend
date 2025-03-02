const express = require('express');
const { model } = require('mongoose');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Create a Using:POST "/api/login-auth".Doesnt require Auth

router.post('/',[
  body('email','Enter a valid Email').isEmail(),
  body('password','Enter alleast 8 character password').isLength({ min: 8 }),
],
(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  User.create({
    email: req.body.email,
    password: req.body.password,
  }).then(user => res.json(user))
  .catch(err=>{console.log(err)
  res.json({error:'Please enter unique value for email',message:err.message})})
})
module.exports = router

