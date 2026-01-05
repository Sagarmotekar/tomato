import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// placing user order for frontend
const placeOrder = async (req,res)=> {
const frontend_url = "http://localhost:5174";
    try {
        const newOrder = new orderModel({
            userId : req.body.userId,
            items : req.body.items,
            amount : req.body.amount,
            address : req.body.address,
            payment : req.body.payment
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});
        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:"inr",
                product_data:{
                    name:item.name,
                },
                unit_amount:item.price*100
            },
            quantity:item.quantity
        }))
        line_items.push({
            price_data:{
                currency:"inr",
                product_data:{
                    name:"Delivery charges",            
            },
                unit_amount:2*100*80
            },
            quantity:1

        })
        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:'payment',
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })
        res.json({success:true,session_url:session.url});
        } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error placing order"});
    }
}
const verifyOrder = async (req,res)=>{
    const {orderId,success} = req.body;
    try {
        if(success=="true") {
            await orderModel.findByIdAndUpdate(orderId,{payment:true})
            res.json({success:true,message:"Paid"})
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Payment failed, order cancelled"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

// userOrders for frontend
const userOrders = async (req,res)=>{
    try {
        const orders = await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error fetching orders"});
    }
}
// listing orders for admin panel
const listOrders = async(req,res)=>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}
// api for updationg order status
const updateStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId || req.body.id || req.body.order;
        const status = req.body.status;

        if (!orderId || !status) {
            return res.json({
                success: false,
                message: "Missing data"
            });
        }

        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({
            success: true,
            message: "Status Updated"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error updating status"
        });
    }
};


export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus};