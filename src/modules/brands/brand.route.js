import { Router } from "express";
//contoller
import * as BC from './brand.controller.js'
//validation
import * as BV from "./validation.js";
import { validation } from '../../middleware/validation.js'
// file management
import configureUpload from "../../middleware/multer.js";
import { fileTypes } from "../../middleware/multer.js";
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router()
route.post('/',
    configureUpload(fileTypes.images)
        .single('image'),
    validation(BV.createBrand),
    auth(systemRoles.Admin),
    BC.createbrand)

route.patch('/:id',
    configureUpload(fileTypes.images)
        .single('image'),
      validation(BV.updateBrand),
     auth(systemRoles.Admin),
    BC.updatebrand)



    route.delete('/:id',
         validation(BV.deleteBrand),
         auth(systemRoles.Admin),
        BC.deleltebrand)
    

        route.get('/',
            auth(Object.values(systemRoles)),
           BC.getBrands)
       
   

export default route