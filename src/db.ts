import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const uri: string = process.env.DB_ORIGIN!;

export const connectDB = async () =>{
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (err){
        console.log(err);
    }
}

