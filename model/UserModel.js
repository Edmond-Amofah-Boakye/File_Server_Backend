import crypto from 'crypto'
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userModel = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user name is required"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "user email is required"],
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Please provide valid email"
    ],
    lowercase: true
  },

  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [6, "password is short"],
    select: false,
  },

  picture: {
    type: String,
    default: "default.avif"
  },

  role:{
    type: String,
    enum: ["user", "admin"],
    default: "user"
},

  confirmed: {
    type: Boolean,
    default: false,
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
}, {timestamps: true});

//Hsahing password
userModel.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

//finding all users which are active 
userModel.pre(/^find/, function (next) {
  this.find({ active: { $ne: false }});
  next();
});

//compare password
userModel.methods.comparePassword = async function (password, hashedPassword){
  return await bcrypt.compare(password, hashedPassword);
};

//generate login token
userModel.methods.generateToken = function (){
  return jwt.sign({ id: this._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

//generate confirmation token
userModel.methods.generateConfirmationToken = function(){
  const token = crypto.randomBytes(32).toString("hex");
  return crypto.createHash("sha256").update(token).digest("hex")
}

export default mongoose.model("user", userModel);
