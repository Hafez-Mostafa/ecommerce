import cartModel from '../../../db/models/cart.model.js';
import productModel from '../../../db/models/product.model.js';
import couponModel from '../../../db/models/coupon.model.js';
import orderModel from '../../../db/models/order.model.js';

import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";
import { createInvoice } from "../../../utils/pdf.js";
import { otp } from '../../../services/otp.js';
import { payment } from '../../../utils/payment.js';
import Stripe from 'stripe';
import coupon from '../../../db/models/coupon.model.js';



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
        product.price = checkProduct.subPrice;
        // product.quantity = quantity?quantity :checkProduct.quantity;
        product.finalPrice = product.quantity * checkProduct.subPrice; // Assuming `checkProduct.price` is the correct price field
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

    let date = order.createdAt.toISOString().slice(0, 10)
    //create Invoice
    const invoice = {
        shipping: {
            name: `${req.user.firstname} ${req.user.firstname}`,
            address: ` ${req.user.address[1]}, ${req.user.address[0]}`,
            city: ` ${req.user.address[2]}`,
            state: ` NRW`,
            postal_code: req.user.address[3]
        },
        items: order.products,
        subtotal: order.subPrice * 100,
        paid: order.totalPrice * 100,
        invoice_nr: order._id,
        date: date,
        coupon: req.body.coupon?.amount || 0

    };




    // await createInvoice(invoice, "invoice.pdf");
    // await otp(req.user.email,"Order Placed","Your Order has been placed successfully",[
    //     {path:"invoice.pdf", contentType:"application/pdf"},
    //     {path:"Nagarro.jpg", contentType:"image/jpg"}
    // ])

    if (paymentMethod == "cash") {
        console.log('in session')
        const stripe = new Stripe(process.env.STRIPE_SEKRET_KEY)
        if(req.body?.coupon){
            const coupon = await stripe.coupons.create({
                percent_off:req.body.coupon?.amount,
                duration:"once"
            })
            req.body.couponId = coupon.id
        }

        const session = await payment({
            
            stripe: new Stripe(process.env.STRIPE_SEKRET_KEY),
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: req.user.email,
            metadata:{
                orderId:order._id.toString()
            },
            success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
            cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
            line_items: order.products.map((product) => {
                return {
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: product.title,
                            // images:[product.image.secure_url],
                        },
                        unit_amount: product.price * 100
                    },
                    quantity: products.quantity || quantity

                }
            }),
            discounts:req.body?.coupon ? [{coupon:req.body.couponId}]:[]
        });
       return  res.status(201).json({ msg: "Paid Successfully", url:session.url ,order});


    }
    req.data = { model: orderModel, id: order._id }

    return  res.status(201).json({ msg: "Order created Successfully", order });
});

//========================End create Order ===============================================================
export const webhook = asyncHandling(async (req, res, next) => {


        const stripe = new Stripe(process.env.STRIPE_SEKRET_KEY)
    
        const sig = req.headers['stripe-signature'];
    
      let event;
    
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.ENDPOINTSECRET);
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
    
      const {orderId}=event.data.object.metadata
      // Handle the event
      if (event.type !==  'checkout.session.completed')  {
        //   const checkoutSessionCompleted = event.data.object;
        await orderModel.update({_id:orderId},{status:'rejected'})
        return res.status(400).json({msg:"fail"})
      }
      await orderModel.update({_id:orderId},{status:'placed'})
      return res.status(400).json({msg:"done"})
    
    
})






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
