import mongoose from "mongoose";

const fileModel = new mongoose.Schema({
    title:{
        type: String,
        required: [true, "File name is required"],
        trim: true,
        unique: true,
        maxlength: 30
    },

    description:{
        type: String,
        required: [true, "File description is required"],
    },

    type:{
        type: String,
        required: [true, "file type is required"]
    },

    file:{
        type: String,
        required: [true, "file should be uploaded"]
    },

    downloads:{
        type: Number,
        default: 0
    },

    emails:{
        type: Number,
        default: 0
    },

    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
   
}, {timestamps: true})


export default mongoose.model("file", fileModel)