import mongoose from "mongoose";

export const connectDB = async () =>{
    try {
    await mongoose.connect("mongodb+srv://sagar2004:sagar906794@sagarfirst.nfa023p.mongodb.net/food-del");
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection failed:", error);
  }
}

