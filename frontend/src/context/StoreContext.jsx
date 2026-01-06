import { createContext, useEffect, useState } from "react";
import api from "../api/axios"; // Uses the instance with withCredentials: true

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState({});
    const [food_list, setFoodList] = useState([]);

    // 1. Fetch Food List (Public data - works even if logged out)
    const fetchFoodList = async () => {
        try {
            const response = await api.get("/api/food/list");
            setFoodList(response.data.data);
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    // 2. Load User Profile and Cart 
    const loadUserProfile = async () => {
        try {
            // This call checks the secure HttpOnly cookie on the backend
            const response = await api.get("/api/user/profile");
            
            if (response.data.success) {
                setUser(response.data.user);
                setIsLoggedIn(true);
                
                // Fetch the user's specific cart data once authenticated
                const cartResponse = await api.post("/api/cart/get", {});
                setCartItems(cartResponse.data.cartData || {});
            }
        } catch (error) {
            console.log("No active session or token expired.");
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    // 3. Logout Function (Clears cookie on backend and state on frontend)
    const logout = async () => {
        try {
            await api.post("/api/user/logout");
            setIsLoggedIn(false);
            setUser(null);
            setCartItems({});
            // Redirect to home page
            window.location.replace("/"); 
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Initial App Load Logic
    useEffect(() => {
        async function initData() {
            await fetchFoodList(); // Load menu
            await loadUserProfile(); // Restore session
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
        loadUserProfile,
        logout 
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;