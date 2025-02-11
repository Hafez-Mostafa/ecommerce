import { Router } from "express";
//contoller
import * as CC from './cart.controller.js'
//validation
import * as CV from "./validation.js";
import { validation } from '../../middleware/validation.js'
// file management
import configureUpload from "../../middleware/multer.js";
import { fileTypes } from "../../middleware/multer.js";
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router()

route.post('/',
    validation(CV.createCart),
    auth([systemRoles.Admin]),
    CC.createCart)


route.patch('/',
    validation(CV.removeCart),
    auth([systemRoles.Admin]),
    CC.removeCart)

route.put('/',
    validation(CV.clearCart),
    auth([systemRoles.Admin]),
    CC.clearCart)




export default route