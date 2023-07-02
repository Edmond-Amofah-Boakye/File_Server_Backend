import sendEmail from "../utils/sendMail.js";
import userModel from "../model/UserModel.js";
import tokenModel from "../model/TokenModel.js";
import AppError from "../utils/AppError.js";

//filter fileds to update
const filterObject = (obj, ...allowedFields) =>{
  const newObj = {}
  Object.keys(obj).forEach(field=>{
    if(allowedFields.includes(field)){
      newObj[field] = obj[field]
    }
  })
  return newObj
}


//check user existence
const checkUserExists = (user) =>{
  return (req, res, next)=>{
    if(!user){
      return next(new AppError("cannot find user", 404))
    }
  }
}



export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("provide credentials", 404));
  }

  try {
    const userExists = await userModel.findOne({ email }).select("+password");
    if (!userExists) {
      return next(new AppError("invalid credentials", 404));
    }

    if (userExists.confirmed === false) {
      return next(
        new AppError(
          "cannot login, please confirm your account through your email",
          403
        )
      );
    }

    if (
      userExists &&
      (await userExists.comparePassword(password, userExists.password))
    ) {
      const token = userExists.generateToken();

      res.cookie("jwt", token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)  
    })
      
      return res.status(201).json({
        role: userExists.role,
        message: "login successful"
      });
    }
  
    return next(new AppError("invalid credentials", 404));
  } catch (error) {
    next(error);
  }
}

//verify account

export async function verifyEmail(req, res, next) {
  const { token } = req.params;
  try {
    const findToken = await tokenModel.findOne({
      confirmationToken: token,
    });

    if (!findToken) {
      return next(new AppError("sorry, invalid link"), 404);
    }
    const user = await userModel.findOne({ _id: findToken.id });

    //checking if user exists
    if(!user){
      return next(new AppError("no user found", 404))
    }
    
    //set confirmation token to false
    findToken.confirmationToken = undefined;
    await findToken.save();
    
    //change user confrimation status to true
    user.confirmed = true;
    await user.save();

    res.status(200).json({
      message: "Activation Successful, please log in",
    });
  } catch (error) {
    next(error);
  }
}

//forgotpassword

export async function forgotPassword(req, res, next) {
  const { email } = req.body;
  try {
    const userExists = await userModel.findOne({ email });

    //check if user Exists
    if(!userExists){
      return next(new AppError("no user found", 404))
    }

    
    const userInTokenModel = await tokenModel.findOne({ id: userExists._id });

    //check if user Exists in token model
    if(!userInTokenModel){
      return next(new AppError("no user found", 404))
    }

    const token = userInTokenModel.generteReseteToken();
    await userInTokenModel.save(); 

    //sending email
    const url = `http://localhost:5173/password/reset/${userInTokenModel.resetPasswordToken}`;
    new sendEmail(userExists.email, "", url).resetpassword();

    res.status(201).json({
      message: "successful, activate your account through your email",
    });
  } catch (error) {
    next(error);
  }
}

//reset password
export async function resetPassword(req, res, next) {
  const { token } = req.params;
  const { password } = req.body;
  try {
    //check token
    const tokenExists = await tokenModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiration: { $gt: Date.now() },
    });
    if (!tokenExists) {
      return next(new AppError("link expired", 403));
    }
    //find user 
    const userExists = await userModel.findOne({ _id: tokenExists.id });
    
    //save new password
    userExists.password = password;
    await userExists.save();

    tokenExists.resetPasswordToken = undefined;
    tokenExists.resetPasswordTokenExpiration = undefined;
    await tokenExists.save()

    res.status(200).json({
      message: "password reset successful, please log in",
    });
  } catch (error) {
      next(error);
  }
}


//find me
export async function findMe(req, res, next){
  try {
    const user = await userModel.findById(req.user.id)

    //check if user Exists
    checkUserExists(user)

    res.status(200).json({
      message: " success",
      user
    })
    
  } catch (error) {
    next(error)
  }
}



//edit me
export async function editMe(req, res, next){
  try {

    const filterBody = filterObject(req.body, "name", "email")
    if(req.file){
      filterBody.picture = req.file.filename;
    }

    const user = await userModel.findByIdAndUpdate(req.user.id, filterBody, {
      new: true,
      runValidators: true
    })
   
    res.status(200).json({
      message: " success",
      user
    })

  } catch (error) {
    next(error)
  }
}

//change logged in user password

export async function changePassword(req, res, next){
  try {
    const userExists = await userModel.findById(req.user.id)

    //check if user Exists
    checkUserExists(userExists)
  
    userExists.password = req.body.password;
    await userExists.save()
  
    res.status(200).json({
      message: " password sucessfully updated",
      userExists
    })
    
  } catch (error) {
    next(error)
  }
}


//delete me
export async function deleteMe(req, res, next){
  await userModel.findByIdAndUpdate(req.user.id, {active: false})
  res.status(204).json({
    status: "successfully deleted",
    data: null
  })
}


//search user

export async function searchUser(req, res, next){
  try {
   const user = await userModel.find({
       "$or":[
         {name:{"$regex": req.params.search}}
       ]
   })
   
   if(user.length === 0){
     return next(new AppError("nothing found", 404))
   }
   
   return res.status(200).json({
     data: user
   })
  
 } catch (error) {
    next(error)
 }
}


//Logout user
export async function Logout (req, res, next){
  res.cookie("jwt", "logout",{
    httpOnly: true,
    expires: new Date(Date.now() + 2 * 1000)  
})
 res.status(201).json({
    message: "logout successful"
  });
}