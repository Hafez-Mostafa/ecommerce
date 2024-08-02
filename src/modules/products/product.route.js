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

import routeReview from '../reviews/review.route.js'
import routeWishList from '../wishlists/wishList.route.js'



const route = Router()
route.use('/:productId/reviews', routeReview)
route.use('/:productId/wishLists', routeWishList)


route.post('/',
    configureUpload(fileTypes.images).fields([
        { name: "image", maxCount: 1 },
        { name: 'coverImages', maxCount: 4 }]),
    validation(PV.createProduct),
    auth([systemRoles.Admin]),
    PC.createProduct)

route.put('/:id',
    configureUpload(fileTypes.images).fields([
        { name: "image", maxCount: 1 },
        { name: 'coverImages', maxCount: 4 }]),
    validation(PV.updateProduct),
    auth([systemRoles.Admin]),
    PC.updateProduct)




    route.delete('/:id',
        validation(PV.deleteProduct),
        auth([systemRoles.Admin]),
       PC.deleteProduct)


       route.get('/',
       PC.getProducts)

export default route