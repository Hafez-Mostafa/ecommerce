import cartModel from '../../../db/models/cart.model.js';
import productModel from '../../../db/models/product.model.js';
import couponModel from '../../../db/models/coupon.model.js';
import orderModel from '../../../db/models/order.model.js';

import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";

export const createOrder = asyncHandling(async (req, res, next) => {
    const { productId, quantity, couponCode, address, phone, paymentMethod } = req.body;

    if (couponCode) {
        const coupon = await couponModel.findOne({ code: couponCode.toLowerCase(), usedBy: { $nin: [req.user._id] } });
        if (!coupon || coupon.toDate < Date.now()) {
            return next(new AppError('coupon not exists or expired', 404));
        }
        req.body.coupon = coupon;
    }

    let products = [];
    let flag = false;
    let subPrice = 0;
    let finalProducts = [];

    if (productId) {
        products = [{ productId, quantity }];
    } else {
        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart || !cart.products.length) {
            return next(new AppError('cart is empty, please select a product', 404));
        }
        products = cart.products;
        flag = true;
    }

    for (let product of products) {
        const checkProduct = await productModel.findOne({ _id: product.productId, stock: { $gte: product.quantity } });
        if (!checkProduct) {
            return next(new AppError('product not exists or out of stock', 404));
        }

        if (flag) product = product.toObject();

        product.title = checkProduct.title;
        product.price = checkProduct.price;
        product.finalPrice = product.quantity * checkProduct.price; // Assuming `checkProduct.price` is the correct price field

        subPrice += product.finalPrice;
        finalProducts.push(product);
    }

    const order = await orderModel.create({
        user: req.user._id,
        products: finalProducts,
        subPrice,
        couponId: req.body?.coupon?._id,
        totalPrice: subPrice - (subPrice * (req.body.coupon?.amount || 0) / 100),
        paymentMethod,
        status: paymentMethod === 'cash' ? 'placed' : 'waitPayment',
        phone,
        address
    });

    res.status(201).json({ msg: "Order created Successfully", order });
});
