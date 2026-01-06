import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PLACE ORDER
const placeOrder = async (req, res) => {
  try {
    const userId = req.userId; // ✅
    const { items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: false
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const line_items = items.map(item => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// VERIFY ORDER
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Verification error" });
  }
};

// USER ORDERS
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// ADMIN
const listOrders = async (req, res) => {
  const orders = await orderModel.find({});
  res.json({ success: true, data: orders });
};

const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.json({ success: false, message: "Missing data" });
  }

  await orderModel.findByIdAndUpdate(orderId, { status });
  res.json({ success: true, message: "Status updated" });
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
