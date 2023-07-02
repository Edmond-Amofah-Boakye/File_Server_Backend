import auth from '../middleware/auth.js'
import restrictAccessTo from '../middleware/restrictAcessTo.js';
import upload from '../middleware/upload.js'
import * as FileController from '../controller/FileController.js'
import { Router } from "express";

const router = Router()

//protect all routes under this

router.route("/preview/:filename").get(FileController.previewFile)
router.use(auth)
router.route("/downloads/:filename").get(FileController.downloadFile)
router.route("/email/:filename").post(FileController.sendFiletoEmail)
router.route("/key/:search").get(FileController.searchFile)
router.route("/").get(FileController.getFiles)
router.route("/:id").get(FileController.getFile)



//restricting to only admin
router.use(restrictAccessTo("admin"))

router.route("/create").post(upload.single("file"), FileController.createFile)

router.route("/:id")
    .patch(upload.single("file"), FileController.updateFile)
    .delete(FileController.deleteFile)

    





export default router;