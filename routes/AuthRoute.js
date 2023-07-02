import auth from '../middleware/auth.js'
import restrictAccessTo from '../middleware/restrictAcessTo.js';
import uploads from '../middleware/upload.js'
import * as AuthController from '../controller/AuthController.js'
import { Router } from "express";

const router = Router()


router.route('/login').post(AuthController.login)
router.route('/logout').get(AuthController.Logout)
router.route('/verify/email/:token').get(AuthController.verifyEmail)
router.route('/password/forgot').post(AuthController.forgotPassword)
router.route('/password/reset/:token').post(AuthController.resetPassword)


//protect all routes under this
router.use(auth)
router.use(restrictAccessTo("admin"))

router.route('/me').get(AuthController.findMe)
router.route('/edit/me').patch(uploads.single("image"), AuthController.editMe)
router.route('/me/edit/password').post(AuthController.changePassword)
router.route('/delete/me').delete(AuthController.deleteMe)
router.route('/:search').get(AuthController.searchUser)

export default router;