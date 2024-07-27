import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
    comment: {
        type: String,
        trim: true,
        required: [true, ' comment is required!'],
        minlength: [3, 'code  must be at least 3 characters long'],
    },
    rate: {
        type: Number,
        required: [true, 'rate is required'],
        min: 1,
        max: 5

    }
    ,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',  // Reference to the User model
        required: true

    }
}, {
    timestamps: true, versionKey: false
});

const review = mongoose.model('Review', reviewSchema);

export default review;
