import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
    title: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'First name is required!'],
        lowercase: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [30, 'Name must not be more than 15 characters long']
    }, createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    }, image: [{
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }], coverImages: [{
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }], description:{
        type: String,
        trim: true,
        required: [true, 'description is required!'],
        minlength: [3, 'description must be at least 3 characters long'],
    },
    slug: {
        type: String,
        trim: true,
        required: [true, 'slug name is required!'],
        minlength: [3, 'slug must be at least 3 characters long'],
        maxlength: [30, 'slug must not be more than 15 characters long'],
        unique: true  // Ensures each category has a unique slug
    }, customId: {
        type: String,
        required: [true, 'customId is required!']
    }, category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }, subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    }, brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    }, price: {
        type: Number,
        required: true,
        min: 1
    }, subPrice: {
        type: Number,
        default: 1,
    }, discount: {
        type: Number,
        default: 1,
        required: true,
        min: 1,
        max: 100
    }, rateAvg: {
        type: Number,
        default: 1,
    }, stock: {
        type: Number,
        requird: true,
        default: 1,
    }








}, {
    timestamps: true, versionKey: false,
    toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const productModel = mongoose.model('Product', productSchema);

export default productModel;
