import sendEmail from "../utils/sendMail.js";
import userModel from "../model/UserModel.js";
import tokenSchema from '../model/TokenModel.js'
import AppError from '../utils/AppError.js'
import APIFeatures from '../utils/APIFeatures.js'

//creating user
export async function createUser(req, res, next) {
  const { name, email, password, role } = req.body;
  
  try {

    const userExists = await userModel.findOne({email})

    if(userExists){
      return next(new AppError("user with email already exist", 400))
    }
    if(password.length < 6){
      return next(new AppError("password lenght should be more than 6", 400))
    }
    const user = new userModel({
      name, email, password, role
    });

    await user.save();

    const token = user.generateConfirmationToken()

    //save user to token schema
    const newToken = new tokenSchema({
      id: user._id,
      confirmationToken: token
    })

    await newToken.save()

    //sending email
    const userName = user.name.split(" ")[0]
    const url = `http://localhost:5173/verify/${newToken.confirmationToken}`
    new sendEmail(user.email, userName, url).verifyEmail()
       
    res.status(201).json({
      message: "Sucess, activate your account through your email",
      user,
    });
  } catch (error) {
    next(error);
  }
}

//get all users

export async function getAllUsers(req, res, next){
  try {
    
    const features = new APIFeatures(userModel.find().select("+active"), req.query)
      .filter()
      .sort()
      .pagination()
    
      const users = await features.query;
    
    return res.status(200).json({
      message: "success",
      users
    })
  } catch (error) {
    next(error)
  }
}



//get single user

export async function findUser (req, res, next){
  const { id } = req.params;

  try {
    const user = await userModel.findById(id)
    if(!user){
      return next(new AppError("no user found", 404))
    }
    return  res.status(200).json({
      message: "success",
      user
    })
  } catch (error) {
    next(error)
  }
}


export async function deleteUser(req, res, next){
  try {
    const userExists = await userModel.findById(req.params.id)
    if(!userExists ){
      return next(new AppError("no user found", 404))
    }

    await userModel.findByIdAndDelete(req.params.id)
    res.status(204).json({
        message: "successfully deleted",
      })

  } catch (error) {
    next(error)
  }
}