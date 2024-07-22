import { Router } from "express";
//contoller
import * as PC from './product.controller.js'
//validation
import * as PV from "./validation.js";
import { validation } from '../../middleware/validation.js'
// file management
import configureUpload from "../../middleware/multer.js";
import { fileTypes } from "../../middleware/multer.js";
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router({ mergeParams: true })

route.post('/',
    configureUpload(fileTypes.images).fields([
        { name: "image", maxCount: 1 },
        { name: 'coverImages', maxCount: 4 }]),
    validation(PV.createProduct),
    auth(systemRoles.Admin),
    PC.createProduct)

// route.patch('/:id',
//     configureUpload(fileTypes.images)
//         .single('image'),
//     //  validation(PV.updateSubCategory),
//      auth(systemRoles.Admin),
//     PC.updateCategory)




//     route.delete('/:id',
//         validation(PV.deleteSubCategory),
//         auth(systemRoles.Admin),
//        PC.deleteSubCategory)


//        route.get('/',
//         // auth(Object.values(systemRoles)),
//        PC.getSubCategories)

export default route