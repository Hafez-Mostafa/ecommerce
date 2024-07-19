import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

export const connectionDB = async () => {

    const connection = await mongoose.connect(process.env.MONGO_CLOUD_URL)
    console.log(`Database is successfully Connected! ...`)
    if (!connection) return next(new AppError(`No Connection is istablished! .. `, 400))
}    
export default connectionDB