import { createContext, useEffect, useState } from "react";
import api from "../api/axios"; // Uses the instance with withCredentials: true

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState({});
    const [food_list, setFoodList] = useState([]);

    // 1. Fetch Food List (Public data)
    const fetchFoodList = async () => {
        try {
            const response = await api.get("/api/food/list");
            setFoodList(response.data.data);
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    // 2. Load User Profile and Cart (The logic you requested)
    const loadUserProfile = async () => {
        try {
            // This call succeeds only if the 'token' cookie is valid
            const response = await api.get("/api/user/profile");
            
            if (response.data.success) {
                setUser(response.data.user);
                setIsLoggedIn(true);
                
                // Once we know the user is valid, fetch their specific cart data
                const cartResponse = await api.post("/api/cart/get", {});
                setCartItems(cartResponse.data.cartData || {});
            }
        } catch (error) {
            // If 401 Unauthorized, we ensure state is cleared
            console.log("Session expired or no user logged in.");
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    // 3. Initial App Load
    useEffect(() => {
        async function initData() {
            await fetchFoodList(); // Load food menu first
            await loadUserProfile(); // Then check if user is logged in
        }
        initData();
    }, []);

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
        if (isLoggedIn) {
            await api.post("/api/cart/add", { itemId });
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] - 1
        }));
        if (isLoggedIn) {
            await api.post("/api/cart/remove", { itemId });
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const product = food_list.find(p => p._id === item);
                if (product) {
                    totalAmount += product.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        isLoggedIn,
        setIsLoggedIn,
        user,
        loadUserProfile // Exported so you can call it manually after Login
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;