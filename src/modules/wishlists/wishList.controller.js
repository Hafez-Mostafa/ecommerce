
import wishListModel from '../../../db/models/wishList.model.js';
import productModel from '../../../db/models/product.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";

export const createWishList = asyncHandling(async (req, res, next) => {
    const { productId } = req.params

    const product = await productModel.findById(productId);
    if (!product) return next(new AppError('Product not exists', 404))

    const wishListExist = await wishListModel.findOne({ user: req.user._id, })

    if (!wishListExist) {
        const wishList = await wishListModel.create({
            products: [productId],
            user: req.user._id

        })
        res.status(201).json({ msg: "Product added to Wishlist", wishList })

    }
    const wishList = await wishListModel.findOneAndUpdate({ user: req.user._id }, {
        $addToSet: { products: [productId] }
    }, { new: true })

    res.status(201).json({ msg: "Product added to Wishlist", wishList })


})



export const removeWishList = asyncHandling(async (req, res, next) => {
    const { id } = req.params


    const wishListExist = await wishListModel.findOne({ user: req.user._id, _id: id })

    if (!wishListExist) return next(new AppError('WiahList not exists', 404))


    const wishList = await wishListModel.findOneAndDelete({ user: req.user._id , _id: id }, {
        $pull: { products: [id] }
    }, { new: true })

    res.status(201).json({ msg: "Wishlist is deleted", wishList })


})


