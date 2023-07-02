import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import FileModel from '../model/FileModel.js'
import AppError from '../utils/AppError.js';
import sendFile from '../utils/SendFile.js';
import APIFeatures from '../utils/APIFeatures.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const filterObject = (obj, ...allowedFields) =>{
    const newObj = {}
    Object.keys(obj).forEach(field=>{
      if(allowedFields.includes(field)){
        newObj[field] = obj[field]
      }
    })
    return newObj
  }

//creating File
export async function createFile(req, res, next) {
    const { title, description, type } = req.body;

    const createdFile = new FileModel({
      title,
      description,
      type,
      file: req.file.filename,
      createdBy: req.user.id
    });
  
    try {
      if(!createdFile){
          return next(new AppError("could not create file", 500))
      }
      await createdFile.save();
  
      res.status(201).json({
        message: "file successfully created",
        createdFile,
      });
    } catch (error) {
      next(error);
    }
  }
  
 

  //get all files

export async function getFiles(req, res, next){
    try {
      const features = new APIFeatures(FileModel.find(), req.query)
        .filter()
        .sort()
        .pagination()

      const files = await features.query;

      return res.status(200).json({
        message: "success",
        files
      })
    } catch (error) {
      next(error)
    }
  }


  //get single file

export async function getFile (req, res, next){
    const { id } = req.params;
  
    try {
      const file = await FileModel.findById(id)
      if(!file){
        return next(new AppError("no file found", 404))
      }
      return  res.status(200).json({
        message: "success",
        file
      })
    } catch (error) {
      next(error)
    }
  }


  //edit file
export async function updateFile(req, res, next){
    try {

      const fileExist = await FileModel.findById(req.params.id)
       //authorization
      if(!fileExist || fileExist.createdBy.toString() !== req.user.id){
          return next(new AppError("cannnot access this file", 400))
      }

      const filterBody = filterObject(req.body, "title", "description", "type")
      if(req.file){
        filterBody.file = req.file.filename;
      }
  
      const updatedFile = await FileModel.findByIdAndUpdate(req.params.id, filterBody, {
        new: true,
        runValidators: true
      })
     
      res.status(200).json({
        message: " success",
        updatedFile
      })
  
    } catch (error) {
      next(error)
    }
  }
 

  //delete file

  export async function deleteFile(req, res, next){
    const { id } = req.params;

    try {
      const fileExist = await FileModel.findById(id)
        //authorization
        if(!fileExist || fileExist.createdBy.toString() !== req.user.id){
            return next(new AppError("cannnot access this file", 400))
        }

        await FileModel.findByIdAndDelete(id)
        res.status(204).json({
            message: "successfully deleted",
          })
    } catch (error) {
        next(error)
    }
  }

//downloads
  export async function downloadFile(req, res, next){
    const { filename } = req.params;
    try {
        const fileExists = await FileModel.findOne({file:filename})
        if(!fileExists){
            return next(new AppError("no file found", 404))
        }
    
        const filePath = path.join(__dirname, "../uploads", filename)
        
        res.set("Content-Disposition", "attachment")

        res.sendFile(filePath)

        fileExists.downloads+=1;
        fileExists.save()

       
        
    } catch (error) {
        next(error)
    }
  }

 //Sending file to an email
 
  export async function sendFiletoEmail(req, res, next){
    const { email, message } = req.body
    const { filename} = req.params
    try {

      const fileExists = await FileModel.findOne({file: filename})
      if(!fileExists){
        return next(new AppError("no file found", 404))
      }

      //reading file
      const filePath = path.join(__dirname, "../uploads", filename)

       console.log(filePath);
      //send file
      try {
        sendFile(email, message, filename, filePath)
        //increasing file email count
        fileExists.emails+=1;
        await fileExists.save()
  
        res.status(201).json({
          message: "file sucessfully sent"
        })
        
      } catch (error) {
         next(new AppError("Internal server error", 500));
      }

    } catch (error) {
      next(new AppError("Internal server error", 500));
    }
  }

  //search file

  export async function searchFile (req, res, next){
    try {
      const findFile = await FileModel.find({
          '$or':[
            {title: {$regex: req.params.search}},
            {description: {$regex: req.params.search}}
          ]
      })
    
    if(findFile.length === 0){
      return next(new AppError("no file found", 404))
    }

    return res.status(200).json({
      data: findFile
    })
     
    } catch (error) {
      next(error)
    }
  }


  //preview file

  export async function previewFile(req, res, next){
    const { filename } = req.params;
    try {
        const fileExists = await FileModel.findOne({file:filename})
        if(!fileExists){
            return next(new AppError("no file found", 404))
        }
    
        const filePath = path.join(__dirname, "../uploads", filename)
        
        res.set("Content-Disposition", "inline")

        res.sendFile(filePath)
        
    } catch (error) {
        next(error)
    }

  }