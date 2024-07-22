
import { nanoid } from 'nanoid';
import couponModel from '../../../db/models/coupon.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";

export const createCoupn = asyncHandling(async (req, res, next) => {


    const { code, amount, fromDate, toDate } = req.body
    // if (!code) code = nanoid(5)
    const exCoupon = await couponModel.findOne({ code })
    if (exCoupon) return next(new AppError('Coupon code is already exist', 409))
    const coupon =await couponModel.create({
        code, amount, fromDate, toDate, fromDate, createdBy: req.user._id
    })
    if (!coupon) return next(new AppError('failed creating new Coupon', 409))

    res.status(201).json({ msg: "Coupon created Successfully", coupon })
})



export const updateCoupn = asyncHandling(async (req, res, next) => {


    const { code, amount, fromDate, toDate } = req.body
    const {id}=req.params
    // if (!code) code = nanoid(5)
    const coupon = await couponModel.findOneAndUpdate({ _id:id,createdBy:req.user._id},{
        code, amount, fromDate, toDate, fromDate, 
    },{new:true})
    
    if (!coupon) return  next(new AppError("Coupon code not exists or yod don't have permission", 409))

    res.status(201).json({ msg: "Coupon created Successfully", coupon })
})