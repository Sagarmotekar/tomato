import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import 'dotenv/config'
import CartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';


// app config
const app = express();
const port = 4000;

//middlewares
app.use(express.json());
app.use(cors());

//db connection 
connectDB();

//api endpoints
app.use("/api/food",foodRouter)
app.use("/images",express.static("uploads"))
app.use("/api/user",userRouter)
app.use("/api/cart",CartRouter)
app.use("/api/order",orderRouter)


app.get("/",(req,res)=>{
    res.send("API is running...");
})

app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})  

//mongodb+srv://sagar2004:<db_password>@sagarfirst.nfa023p.mongodb.net/?appName=sagarfirst