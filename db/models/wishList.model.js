import mongoose, { Schema } from "mongoose";

const wishListSchema = new Schema({

    products: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

    ], user: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
    }

}, {
    timestamps: true, versionKey: false
});

const wishList = mongoose.model('WishList', wishListSchema);

export default wishList;
