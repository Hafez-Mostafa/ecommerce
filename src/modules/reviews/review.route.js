import { Router } from "express";
//contoller
import * as RC from './review.controller.js'
//validation
import * as RV from "./validation.js";
import { validation } from '../../middleware/validation.js'
//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router({mergeParams:true})

route.post('/',
    validation(RV.createReview),
    auth([systemRoles.Admin]),
    RC.createReview)


    route.delete('/:id',
        validation(RV.deleteReview),
        auth([systemRoles.Admin]),
        RC.deleteReview)
    
    

export default route