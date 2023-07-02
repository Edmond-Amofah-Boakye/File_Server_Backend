import user from './routes/UserRoute.js'
import file from './routes/FileRoute.js'
import auth from './routes/AuthRoute.js'
import AppError from "./utils/AppError.js"
import errorMiddleware from "./middleware/error.js";
import connection from "./database/db.js";
import express from "express";
import cors from "cors";
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config({path: './config/.env'})

const app = express()


//handling uncaught
process.on("uncaughtException", ()=>{
    console.log("sorry, something unusual happened, server shutting down!!!");
    process.exit(1)
})


//usimg helmet middleware
app.use(helmet())


//to prevent too many request from one IP Address
const limit = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "too many request from this IP"
})

app.use('/api', limit)





//using cors middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

//using morgan middleware
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
}

app.use(cookieParser())
app.use(express.json({limit: "10kb"}))
app.use(express.urlencoded({extended: true}))
app.use(express.static("./uploads"))


//prevent NoSQL injection
app.use(mongoSanitize())


//route middleware
app.use('/api/v1/user', user)
app.use('/api/v1/auth', auth)
app.use('/api/v1/file', file)



//unhandled routes
app.all("*", (req, res, next)=>{
    next(new AppError(`cannot find ${req.originalUrl} on this server`, 404))
})

//error middleware
app.use(errorMiddleware)


//connecting database
connection()

//Listening to server
const server = app.listen(process.env.PORT, (error)=>{
    if(error){
        console.log(error.message);
    }
    console.log(`APP is Running on http://localhost:${process.env.PORT}`);
})



//Handling unhandledrejection
process.on("unhandledRejection", ()=>{
    console.log("sorry, could not proceed with request");
    server.close(()=>{
        process.exit(1)
    })
})

