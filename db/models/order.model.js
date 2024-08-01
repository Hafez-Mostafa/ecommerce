import mongoose, { Schema, Types } from "mongoose";

const orderSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,

    },
    products: [{
        title: { type: String, required: true },
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
    }],

    subPrice: { type: Number, required: true },
    couponId: { type: Types.ObjectId, ref: 'Coupon', },
    totalPrice: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, required: true, enum: ['card', 'cash'] },
    status: {
        type: String, required: true,
        enum: ['placed', 'waitPayment', 'deliverd', 'onWay', 'cancelled', 'rejected'],
        default:'placed'
    },
    
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
    },
    reason:{type:String}

}, {
    timestamps: true, versionKey: false
});

const order = mongoose.model('Order', orderSchema);

export default order;
