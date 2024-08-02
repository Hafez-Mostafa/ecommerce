import { Router } from "express";
//contoller
import * as SC from './subCategory.controller.js'
//validation
import * as CV from "./validation.js";
import { validation } from '../../middleware/validation.js'
// file management
import configureUpload from "../../middleware/multer.js";
import { fileTypes } from "../../middleware/multer.js";
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router({mergeParams:true})

route.post('/',
    configureUpload(fileTypes.images)
        .single('image'),
     validation(CV.createSubCategory),
    auth([systemRoles.Admin]),
    SC.createSubCategory)

route.patch('/:id',
    configureUpload(fileTypes.images)
        .single('image'),
     validation(CV.updateSubCategory),
     auth([systemRoles.Admin]),
    SC.updateCategory)



    
    route.delete('/:id',
        validation(CV.deleteSubCategory),
        auth([systemRoles.Admin]),
       SC.deleteSubCategory)
   

       route.get('/',
        auth(Object.values(systemRoles)),
       SC.getSubCategories)
   
export default route