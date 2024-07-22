import mongoose, { Schema } from "mongoose";

const couponSchema = new Schema({
    code: {
        type: String,
        unique: true,
        trim: true,
        required: [true, ' code is required!'],
        lowercase: true,
        minlength: [3, 'code  must be at least 3 characters long'],
        maxlength: [30, 'code must not be more than 15 characters long']
    },
    amount:{
        type:Number,
        required: [true, 'amount is required'],
        min:1,
        max:100

    }
    ,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    usedBy:[{
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
    }],
    fromDate:{type:Date, 
        required: [true, 'fromDate is required'],

    },
    toDate:{type:Date, 
        required: [true, 'toDate is required'],

    }
}, {
        timestamps:true,versionKey:false
    });

const coupon = mongoose.model('Coupon', couponSchema);

export default coupon;
