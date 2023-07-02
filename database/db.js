import mongoose from "mongoose";

const connection = async () =>{
   await mongoose.connect(process.env.MONGO)
    .then((data)=>{
        console.log(`database sucessfully connected`);
    })
    .catch((err)=>{
        console.log(`error occured ${err}`);
    })
}


export default connection;