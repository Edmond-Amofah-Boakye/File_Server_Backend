import userModel from '../model/UserModel.js'
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';


const auth = async (req, res, next)=>{
    const token = req.cookies.jwt;

    if(!token){
        return next(new AppError("not authorized", 403))
    }

    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        
        const user = await userModel.findById(decode.id)
        if(!user){
            return next(new AppError("not authorized, log in", 403))
        }
         req.user = user
        next()
        
    } catch (error) {
        next(error)
    }
}

export default auth;