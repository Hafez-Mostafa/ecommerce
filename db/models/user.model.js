import mongoose, { Schema } from "mongoose";
import systemRoles from "../../utils/systemRoles.js";

const generateUsername = (firstname, lastname) => {
    return `${firstname} ${lastname}`;
};

const generateAge = (dob) => {
    const birthDate = new Date(dob);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    const dayDifference = currentDate.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }
    return age;
};

const checkDOB = (value) => {
    if (!(value instanceof Date) || isNaN(value.getTime())) return false;
    const today = new Date();
    if (value >= today) return false;
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    if (value < minDate) return false;
    return true;
};

const userSchema = new Schema({
    firstname: {
        type: String,
        trim: true,
        required: [true, 'First name is required!'],
        lowercase: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [15, 'Name must not be more than 15 characters long']
    },
    lastname: {
        type: String,
        trim: true,
        required: [true, 'Last name is required!'],
        lowercase: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [15, 'Name must not be more than 15 characters long']
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Email is required!'],
        lowercase: true,
        unique: true,
        validate: {
            validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Password is required!']
    },
    recoveryEmail: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Invalid recovery email format'
        }
    },
    DOB: {
        type: Date,
        required: [true, 'Date of Birth is required!'],
        validate: {
            validator: checkDOB,
            message: 'Invalid date format or date is not in a valid range.'
        }
    },
    age: {
        type: Number
    },
    mobileNumber: {
        type: Number,
        unique: true
    },
    address: {type:[String],
        required: [true, 'Address is required!'],

    },
    role: {
        type: String,
        enum: Object.values(systemRoles),
        default: 'user'
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    loggedIn: {
        type:Boolean,
        default: false
    },
    code: String,
    passwordChangedAt: Date
},
{
    timestamps:true,versionKey:false
});

userSchema.pre('save', function (next) {
    // Convert DOB to Date object if it's a string
    if (typeof this.DOB === 'string') {
        this.DOB = new Date(this.DOB);
    }

    // Set the username based on firstname and lastname
    if (this.isModified('firstname') || this.isModified('lastname')) {
        this.username = generateUsername(this.firstname, this.lastname);
    }

    // Set the age based on DOB
    if (this.isModified('DOB')) {
        this.age = generateAge(this.DOB);
    }

    next();
});

const userModel = mongoose.model('User', userSchema);

export default userModel;
