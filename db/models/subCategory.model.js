import mongoose, { Schema } from "mongoose";

const SubCategorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'First name is required!'],
        lowercase: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [30, 'Name must not be more than 15 characters long']
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    image: {
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    slug: {
        type: String,
        trim: true,
        required: [true, 'First name is required!'],
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [30, 'Name must not be more than 15 characters long'],
        unique: true  // Ensures each category has a unique slug
    },
    customId: {
        type: String,
        required: [true, 'CustomID is required!']
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    }
}, {
    timestamps: true, versionKey: false
});

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

export default SubCategory;
