import { Router } from "express";
//contoller
import * as WC from './wishList.controller.js'
//validation
import * as WV from "./validation.js";
import { validation } from '../../middleware/validation.js'
// file management
import configureUpload from "../../middleware/multer.js";
import { fileTypes } from "../../middleware/multer.js";
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router({mergeParams:true})

route.post('/',
    validation(WV.createWishList),
    auth(systemRoles.Admin),
    WC.createWishList)


route.delete('/:id',
    validation(WV.removeWishList),
    auth(systemRoles.Admin),
    WC.removeWishList)




export default route