import { Router } from "express";
//contoller
import * as CC from './coupon.controller.js'
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
    validation(CV.createCoupon),
    auth(systemRoles.Admin),
    CC.createCoupn)


    route.patch('/:id',
        validation(CV.updateCoupon),
        auth(systemRoles.Admin),
        CC.updateCoupn)
    
    

export default route