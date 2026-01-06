import userModel from "../models/userModel.js";

// ADD ITEM TO CART
const addToCart = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from auth middleware
    const { itemId } = req.body;

    const userData = await userModel.findById(userId);
    const cartData = userData.cartData || {};

    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Item added to cart", cartData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

// REMOVE ITEM FROM CART
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;

    const userData = await userModel.findById(userId);
    const cartData = userData.cartData || {};

    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) delete cartData[itemId]; // optional: remove if zero
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Item removed from cart", cartData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

// GET CART
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId);

    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
