import express from "express";
//contoller
import * as CC from './category.controller.js'
//validation
import * as CV from "./validation.js";
import { validation } from '../../middleware/validation.js'
// file management
import configureUpload from "../../middleware/multer.js";
import { fileTypes } from "../../middleware/multer.js";
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";
import subCategoryRouter from "../subCategories/subCategory.route.js";
import {setHeaders} from '../../middleware/setHeader.js'



// const route = express.Router({caseSensitive:true})

const route = express.Router()
route.use('/:categoryId/subCategories',subCategoryRouter,)
route.post('/',
    configureUpload(fileTypes.images)
        .single('image'),
     validation(CV.createCategory),
    auth([systemRoles.Admin]),
    CC.createCategory)



route.patch('/:id',
    configureUpload(fileTypes.images)
        .single('image'),
         setHeaders(),
      validation(CV.updateCategory),
     auth(systemRoles.Admin),
    CC.updateCategory)



    route.delete('/:id',
         validation(CV.deleteCategory),
         auth(systemRoles.Admin),
        CC.delelteCategory)
    

        route.get('/',
            // auth(Object.values(systemRoles)),
           CC.getCategories)
       
   

export default route