import crypto from 'crypto'
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    confirmationToken:{
        type: String
    },

    resetPasswordToken:{
        type: String
    },

    resetPasswordTokenExpiration:{
        type: Date
    }
})

//generate reset token
tokenSchema.methods.generteReseteToken = function(){
    const token = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetPasswordTokenExpiration = Date.now() + 10 * 60 * 1000;

    return token;
}


export default mongoose.model("token", tokenSchema)