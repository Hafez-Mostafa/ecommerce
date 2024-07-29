import cartModel from '../../../db/models/cart.model.js';
import productModel from '../../../db/models/product.model.js';
import couponModel from '../../../db/models/coupon.model.js';
import orderModel from '../../../db/models/order.model.js';

import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";
import createInvoice from '../../../utils/pdf.js';
//========================Start create Order ===============================================================
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
        if (!checkProduct) { return next(new AppError('product not exists or out of stock', 404)); }
        if (flag) product = product.toObject();
        product.title = checkProduct.title;
        product.price = checkProduct.price;
        product.finalPrice = product.quantity * checkProduct.price; // Assuming `checkProduct.price` is the correct price field
        subPrice += product.finalPrice;
        finalProducts.push(product);
    }


    // create order according the upon handled data 
    const order = await orderModel.create({
        user: req.user._id,
        products: finalProducts,
        subPrice,
        couponId: req.body.coupon?._id,
        totalPrice: subPrice - (subPrice * (req.body.coupon?.amount || 0) / 100),
        paymentMethod,
        status: paymentMethod === 'cash' ? 'placed' : 'waitPayment',
        phone,
        address
    });
    // adding the user to coupon model as usedBy
    if (req.body?.coupon)
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $push: { usedBy: req.user._id } })

    // reduce the stock in the productmodel by the ordered quantity
    for (const product of finalProducts) {
        await productModel.findOneAndUpdate({ _id: product.productId }, {
            $inc: { stock: -product.quantity }
        }
        )
    }
    //clear the cart if the order pulled out from it
    if (flag)
        await cartModel.updateOne({ user: req.user._id }, { products: [] })


    //create Invoice


    const invoice = {
        shipping: {
            name: 'req.user.lastname',
            address: 'req.user.address',
            city: 'req.user.address[1]',
            state: "CA",
            country: "US",
            postal_code: 'req.user.address[2]'
        },
        items: order.products,
        subtotal: 8000,
        paid: order.totalPrice,
        invoice_nr: order._id,
        date: order.createdAt
    };

    await createInvoice(createInvoice, "invoice.pdf");




    req.data = { model:orderModel, id:order._id }

    res.status(201).json({ msg: "Order created Successfully", order });
});

//========================End create Order ===============================================================


//========================Start cancelO Order ===============================================================

export const cancelOrder = asyncHandling(async (req, res, next) => {
    const { reason } = req.body;
    const { id } = req.params

    const order = await orderModel.findOne({ _id: id, user: req.user._id })
    if (!order) return next(new AppError('Order not exist ', 404))

    if ((order.paymentMethod === 'cash' && order.status != 'placed')
        || (order.paymentMethod === 'card' && order.status != 'waitPayment')) return next(new AppError('OrYou can not cancell this order ', 404))

    // change order status to cancelled and save the reason
    await orderModel.updateOne({ _id: id }, {
        status: "cancelled",
        cancelledBy: req.user._id,
        reason

    })


    // reomve the user from the coupon as usedBy


    if (order?.couponId)
        await couponModel.updateOne({ _id: order?.couponId }, {
            $pull: { usedBy: req.user._id }
        })
    // decrease the stock in the product model
    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, {
            $inc: { stock: product.quantity }
        })

    }

    res.status(201).json({ msg: "Order cancceled Successfully" });
});



//========================End cancel Order ===============================================================
