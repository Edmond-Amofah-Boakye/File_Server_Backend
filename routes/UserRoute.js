import * as UserController from '../controller/UserController.js'
import restrictAccessTo from '../middleware/restrictAcessTo.js';
import auth from '../middleware/auth.js';
import { Router } from "express";

const router = Router()

router.route('/')
    .post(UserController.createUser)
    .get(auth, UserController.getAllUsers)


    
// protect all routes under this
router.use(auth)
router.use(restrictAccessTo("admin"))

router.route('/:id')
    .get(UserController.findUser)
    .delete(UserController.deleteUser)
    




export default router;