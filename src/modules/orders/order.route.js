import { Router } from 'express'
import express from 'express'
//contoller
import * as OC from './order.controller.js'
//validation
import * as OV from "./validation.js";
import { validation } from '../../middleware/validation.js'

//authenticatin & authentfizierung
import { auth } from "../../middleware/auth.js";
import systemRoles from "../../../utils/systemRoles.js";




const route = Router()

route.post('/',
    validation(OV.createOrder),
    auth([systemRoles.Admin]),
    OC.createOrder)
route.patch('/:id',
    validation(OV.cancelOrder),
    auth([systemRoles.Admin]),
    OC.cancelOrder)





route.post('/webhook',
    express.raw({ type: 'application/json' }),
    OC.webhook)


    route.get('/sucess/:id',OC.success)
    route.get('/cancel',(req,res,next)=> res.status(400).json({msg:'cancel'}))

export default route