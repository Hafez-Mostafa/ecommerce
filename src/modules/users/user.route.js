import { Router } from "express";
//contoller
import * as UC from './user.controller.js'
//validation
import * as UV from "./validation.js";
import {validation} from '../../middleware/validation.js'
// file management
import configureUpload from "../../middleware/multer.js";
import {fileTypes} from "../../middleware/multer.js";
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router()

route.post('/signUp',validation(UV.signUpValidation),UC.signUp)
route.post('/signIn',validation(UV.signInValidation),UC.signIn)
route.get('/verifyEmail/:token',UC.verifyEmail)
route.get('/refreshToken/:refreshToken',UC.refreshToken)
route.patch('/update',  auth(systemRoles.user), UC.updateUser);
route.delete('/delete', auth([systemRoles.user]), UC.deleteUser);
route.patch('/updatePassword', auth(systemRoles.user), UC.updatePassword);
route.patch('/forgotPassword', UC.forgotPassword);
route.patch('/resetpassword', UC.resetPassword);

route.get('/recoverEmail/:token',UC.confirmRecoverEmail)




export default route