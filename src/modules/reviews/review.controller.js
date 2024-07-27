
import { nanoid } from 'nanoid';
import productModel from '../../../db/models/product.model.js';
import orderModel from '../../../db/models/order.model.js';
import reviewModel from '../../../db/models/review.model.js';


import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";

export const createReview = asyncHandling(async (req, res, next) => {

    const { comment, rate } = req.body
    const { productId } = req.params
    console.log(productId)
    // check on product
    const product = await productModel.findById(productId)
    if (!product) return next(new AppError('Product not found', 404))
    // check if already this product reviews
    const reviewExist = await reviewModel.findOne({ createdBy: req.user._id, productId })
    if (reviewExist) return next(new AppError('You are already reviewd', 400))


    // check if the order already deliverd 
    const oreder = await orderModel.findOne({
        user: req.user._id,
        "products.productId": productId, status: 'delivered'
    })
    if (oreder) return next(new AppError('Oreder not found', 404))


    const review = await reviewModel.create({
        comment,
        productId,
        rate,
        createdBy: req.user._id

    })

    // const reviews = await reviewModel.find({ productId })
    // for (const review of reviews) { sum += review.rate }
    // product.rateAvg = sum / reviews.length

    // add the new rate to the sum 
    let sum = product.rateAvg * product.rateNum
    sum = sum + rate
    // increasing the rate number by one ( the current rate giver)
    
    product.rateNum += 1
    product.rateAvg = sum / (product.rateNum)
    



    await product.save()
    res.status(201).json({ msg: 'Review created', review })

})




export const deleteReview = asyncHandling(async (req, res, next) => {
    const { id } = req.params
    

    const review = await reviewModel.findOneAndDelete({ _id:id,createdBy: req.user._id },{new:true})
    if (!review) return next(new AppError('Review is not found', 404))

        const product = await productModel.findOne(review.productId)
    if (!product) return next(new AppError('Product not found', 404))

    let sum = product.rateAvg * product.rateNum
    sum = sum - review.rate
    
    // increasing the rate number by one ( the current rate giver)
    
    product.rateNum -= 1
    product.rateAvg = sum / product.rateNum


    await product.save()
    res.status(201).json({ msg: 'Review deleted', review })

})