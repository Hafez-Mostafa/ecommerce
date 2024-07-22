
import cartModel from '../../../db/models/cart.model.js';
import productModel from '../../../db/models/product.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";

export const createCart = asyncHandling(async (req, res, next) => {


    const { productId,quantity} = req.body

    const product = await productModel.findOne({ _id: productId, stock: { $gte: quantity } });

    if(!product) return next(new AppError('Product not exists or out of Stock',404))
    const exCart=await cartModel.findOne({user:req.user._id,
            // "products.prroductId":productId
        })

    if(!exCart) {
        const cart = await cartModel.create({
            products:[{productId,quantity}],
            user:req.user._id
    
            })
            res.status(201).json({ msg: "Coupon created Successfully", cart })

    }

    let flag = false;
    for (let product of exCart.products) {
        if(productId == product.productId){
            product.quantity += quantity
            flag=true

        }
        
    }

    if(!flag){
        exCart.products.push(
            {productId,quantity}
        )

    }
    
await exCart.save()
    res.status(201).json({ msg: "Cart created  or updated Successfully", exCart })
})



// export const updateCart = asyncHandling(async (req, res, next) => {


//     const { code, amount, fromDate, toDate } = req.body
//     const {id}=req.params
//     // if (!code) code = nanoid(5)
//     const coupon = await couponModel.findOneAndUpdate({ _id:id,createdBy:req.user._id},{
//         code, amount, fromDate, toDate, fromDate, 
//     },{new:true})
    
//     if (!coupon) return  next(new AppError("Coupon code not exists or yod don't have permission", 409))

//     res.status(201).json({ msg: "Coupon created Successfully", coupon })
// })