import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({

    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: { type: Number, 
            required: [true, 'Quantiy must be given'] }
    }], user: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
    }

}, {
    timestamps: true, versionKey: false
});

const cart = mongoose.model('Cart', cartSchema);

export default cart;
