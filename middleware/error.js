import AppError from "../utils/AppError.js";

const errors = (error, req, res, next) =>{

    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";


    //wrong mongoDB ID Error
    if(error.name === "CastError"){
        const message = `Resource not found with this id... Invalid ${error.path}`
        error = new AppError(message, 400)
    }

    //Duplicate key Error
    if(error.code === 1100){
        const message = `Duplicate key ${Object.keys(error.keyValue)} Entered`
        error = new AppError(message, 400)
    }

    //Validation Error
    if(error.name === "validationError"){
        // const errors = Object.keys()
        const message = Object.values(error.errors).map((val)=>val.message)
        error = new AppError(message, 400)
    }
    //wrong jwt error
    if(error.name === "JsonWebTokenError"){
        const message = `Your URL is invalid, please try again later`
        error = new AppError(message, 400)
    }

    //wrong jwt error
    if(error.name === "TokenExpiredError"){
        const message = `Your Token is expired, please try again later`
        error = new AppError(message, 400)
    }


    res.status(error.statusCode).json({
        status: error.status,
        message: error.message
    })
}

export default errors;