import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const url = "http://localhost:4000";

    const [cartItems, setCartItems] = useState({});
    const [food_list, setFoodList] = useState([]);

    // 🔑 restore token on refresh
    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);
    };

    const loadCartData = async () => {
        const response = await axios.post(
            url + "/api/cart/get",
            {},
            { headers: { token } }
        );
        setCartItems(response.data.cartData);
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (token) {
                await loadCartData();
            }
        }
        loadData();
    }, [token]);

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
        if (token) {
            await axios.post(
                url + "/api/cart/add",
                { itemId },
                { headers: { token } }
            );
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] - 1
        }));
        if (token) {
            await axios.post(
                url + "/api/cart/remove",
                { itemId },
                { headers: { token } }
            );
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            const product = food_list.find(p => p._id === item);
            if (product) {
                totalAmount += product.price * cartItems[item];
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
        url,
        token,
        setToken
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;

// import { createContext, useEffect, useState } from "react";
// import { assets } from "../assets/assets";
// import axios from "axios";
// export const StoreContext = createContext(null);

// const StoreContextProvider = (props) => {
//     const [cartItems, setCartItems] = useState({});
//     const url = "http://localhost:4000";
//     const [token, setToken] = useState("");
//     const [food_list, setFoodList] = useState([]);

//     const addToCart = async (itemId) => {
//         if (!cartItems[itemId]) {
//             setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
//         }
//         else {
//             setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
//         }
//         if(token) {
//             await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
//         }
//     }

//     const removeFromCart = async (itemId) => {
//         setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
//         if(token) {
//             await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
//         }
//     }

//     const getTotalCartAmount = () => {
//         let totalAmount = 0;
//         for (const item in cartItems) {
//             if (cartItems[item] > 0) {
//                 let itemInfo = food_list.find((product) => product._id === item);
//                 totalAmount += itemInfo.price * cartItems[item];
//             }
//         }
//         return totalAmount;
//     }
//     const fetchFoodList = async () => {
//         const response = await axios.get(url + "/api/food/list")
//         setFoodList(response.data.data);
//     }

//     const loadCartData = async () => {
//         const response = await axios.post(url + "/api/cart/get",{},{headers:{token}});
//         setCartItems(response.data.cartData);
//     }



//     useEffect(() => {
//         async function loadData() {
//             await fetchFoodList();
//             // if (localStorage.getItem("token")) {
//             //     setToken(localStorage.getItem("token"));
//             //     await loadCartData(localStorage.getItem("token"));
//             // }
//         }
//         loadData();
//     }, [])

//     const contextValue = {
//         food_list,
//         cartItems,
//         setCartItems,
//         addToCart,
//         removeFromCart,
//         getTotalCartAmount,
//         url,
//         token,
//         setToken
//     }
//     return (
//         <StoreContext.Provider value={contextValue}>
//             {props.children}
//         </StoreContext.Provider>
//     )

// }
// export default StoreContextProvider;