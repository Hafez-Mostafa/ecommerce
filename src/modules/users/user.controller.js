import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('../../../config/.env') });

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../../../db/models/user.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";
import { otp } from '../../../services/otp.js';
import mongoose from 'mongoose';
import { nanoid, customAlphabet } from 'nanoid';

//================================signUp=================================================

export const signUp = asyncHandling(async (req, res, next) => {
    const { firstname, lastname, email, password, cpassword, DOB,
        mobileNumber, recoveryEmail, role, address } = req.body;

    // Ensure password and confirm password match
    (password !== cpassword) && next(new AppError('Passwords do not match', 400));

    // Check if the user already exists
    await userModel.findOne({ email: email.toLowerCase })
        && next(new AppError('Email is already in Use', 409));

    // Create token for email confirmation
    const token = jwt.sign({ email }, process.env.JWT_GEN_CONFIRM_EMAIL, { expiresIn: '1h' });
    const otpLink =
        `${req.protocol}://${req.headers.host}/users/verifyEmail/${encodeURIComponent(token)}`;

    const refreshToken = jwt.sign({ email }, process.env.JWT_GEN_CONFIRM_EMAIL);
    const otpRefreshLink =
        `${req.protocol}://${req.headers.host}/users/refreshToken/${encodeURIComponent(refreshToken)}`;

    const sendOTP = await otp(process.env.OPT_CONFIRMATION_EMAIL,
        `User Confirmation @${Date.now()}`, `<h1>Confirmation Account</h1><br><a href=${otpLink}>Confirm the email</a>
        <br> <a href=${otpRefreshLink}>Click here to resend confirmation email</a>`)
    !sendOTP && next(new AppError("Error Sending Email", 400));
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // Create new user
    const user = new userModel({
        firstname, lastname, email, password: hashedPassword, DOB, mobileNumber, recoveryEmail, role, address
    });

    const newUser = await user.save();
    if (!newUser) return next(new AppError('User could not be created', 400));

    res.status(201).json({ msg: 'Signed up successfully', user: newUser });
});


export const verifyEmail = asyncHandling(async (req, res, next) => {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_GEN_CONFIRM_EMAIL);
    if (!decoded?.email) return next(new AppError('invalid token', 400));
    const user = await userModel.findOneAndUpdate({ email: decoded.email, confirmed: false }, { confirmed: true }, { new: true });
    if (!user) return next(new AppError('User not exist or already confirmed', 400))
    res.status(201).json({ msg: 'Email confirmed successfully', user });


});

//================================refreshToken============================================

export const refreshToken = asyncHandling(async (req, res, next) => {
    const { refreshToken } = req.params;
    const decoded = jwt.verify(refreshToken, process.env.JWT_GEN_CONFIRM_EMAIL);
   if( !decoded.email)  return next(new AppError('Invalid Token', 400));

    const user = await userModel.findOne({email:decoded.email,confirmed:true})
    if(user) return next(new AppError('User already confirmed',400))
    // Create new token
    const token = jwt.sign({ email: decoded.email }, process.env.JWT_GEN_CONFIRM_EMAIL,{expiresIn:'10m'});
    const otpLink = `${req.protocol}://${req.headers.host}/users/verifyEmail/${encodeURIComponent(token)}`;
    const checkemail = await otp(decoded.email,process.env.OPT_CONFIRMATION_EMAIL,
        ':) hehe', `<a href=${otpLink}>Confirm the email</a>`);
    if (!checkemail) return next(new AppError("Error Sending Email", 400));
    res.status(201).json({ msg: 'Email confirmed successfully' });
});
//=============================forgotPassword==================================================

export const forgotPassword = asyncHandling(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return next(new AppError('User is not available!', 404));


    const code = customAlphabet('789XYZabcdeFGH123456kLMN', 10)
    const newcode = code()

    await otp(email, "code for reset password", `<h1>your code is ${newcode}</h1>`)
    await userModel.updateOne({ email }, { code: newcode })


    res.status(200).json({ msg: 'A the code is sent to  your email.' });
});

//===================================Reset Password=====================================
export const resetPassword = asyncHandling(async (req, res, next) => {
    const { email, password, code } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return next(new AppError('User is not available!', 404));
    // Check if the user's email is confirmed
    if (user.code != code || code == "") return next(new AppError('invalid code', 404))



    // Hash the new password
    const hashNewPass = bcrypt.hashSync(password, +process.env.ROUND_BHASH_PASSWORD);
    // Update the user's password
    const updatedPass = await userModel.updateOne({ email }, { password: hashNewPass, code: "", passwordChangedAt: Date.now() })
    if (!updatePassword) { return next(new AppError('Error saving new password code', 400)) }
    res.status(200).json({ msg: 'Password reset successfully' });
});

//================================signIn=====================================================
export const signIn = asyncHandling(async (req, res, next) => {
    const { email, password } = req.body;

    // Find user by email and confirmed account
    const user = await userModel.findOne({ email, confirmed: true });

    // Check if user exists
    if (!user) return next(new AppError('User not found or account is not confirmed yet', 400));

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new AppError('Invalid credentials', 401));

    // Create JWT token with expiration
    console.log(process.env.JWT_SECRET)
    const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expiration, e.g., '1h'
    );

    // Update user status to online
    await userModel.updateOne({ email }, { status: true });

    // Send response
    res.status(200).json({ message: 'User signed in successfully', token });
});
//================================updateUser===============================================

export const updateUser = asyncHandling(async (req, res, next) => {
    const { email, mobileNumber, recoveryEmail, DOB, lastname, firstname } = req.body;
    const userId = req.user.id;
    // Check if another user already has the specified email
    const isExEmail = await userModel.findOne({ email, _id: { $ne: userId } });
    if (isExEmail) return next(new AppError('Email already exists', 409));
    // Check if another user already has the specified mobile number
    const isExmobileNumber = await userModel.findOne({ mobileNumber, _id: { $ne: userId } });
    if (isExmobileNumber) return next(new AppError('Mobile number already exists', 409));
    const user = await userModel.findById(userId);
    if (!user || user.status !== 'online') return next(new AppError('User is offline', 404));
    // Update user 
    const updatedUser = await userModel.findByIdAndUpdate(userId, {
        email, mobileNumber, recoveryEmail, DOB, lastname, firstname
    }, { new: true });
    if (!updatedUser) return next(new AppError('Error updating user', 500));
    res.status(201).json({ msg: 'User Updated Successfully', updatedUser })
})

//================================deleteUser===================================================

export const deleteUser = asyncHandling(async (req, res, next) => {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user || user.status !== 'online') return next(new AppError('User is offline, Delete User is not possible', 404));
    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) return next(new AppError('Error Deleting user', 500));
    res.status(201).json({ msg: 'User Deleted Successfully', userId })
})


//================================updatePassowrd===================================================
export const updatePassword = asyncHandling(async (req, res, next) => {
    const userId = req.user.id;
    const { password, newPassword } = req.body;
    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user || user.status !== 'online') return next(new AppError('User is not available or offline!', 404));
    // Check if the current password is correct
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return next(new AppError('Invalid current password', 400));
    // Hash the new password
    const hashNewPass = await bcrypt.hash(newPassword, +process.env.ROUND_BHASH_PASSWORD);
    // Update the user's password
    const updatedUser = await userModel.findByIdAndUpdate(userId, { password: hashNewPass }, { new: true });
    if (!updatedUser) return next(new AppError('Error updating password', 500));

    res.status(200).json({ msg: 'Password updated successfully', user: updatedUser });
});





//=======================================================================================
export const confirmRecoverEmail = asyncHandling(async (req, res, next) => {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_GEN_CONFIRM_EMAIL);
    console.log('decoded', decoded.recoveryEmail)
    const user = await userModel.findOneAndUpdate({ recoveryEmail: decoded.recoveryEmail, confirm: false },
        { confirm: true }, { new: true });
    console.log(user.recoveryEmail)

    if (!user) return next(new AppError('User not found or already confirmed', 404));
    res.status(201).json({ msg: 'Email confirmed successfully and Email Reovered' });

});