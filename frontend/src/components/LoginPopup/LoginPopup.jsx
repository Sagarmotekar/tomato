import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import api from '../../api/axios'; // Use your custom instance

const LoginPopup = ({ setShowLogin }) => {

    // Destructure the new functions from StoreContext
    const { setIsLoggedIn, loadUserProfile } = useContext(StoreContext);
    
    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault();
        
        // Use relative paths because 'api' instance already has the Base URL
        let endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";

        try {
            const response = await api.post(endpoint, data);
            
            if (response.data.success) {
                // 1. Set Auth state to true
                setIsLoggedIn(true);
                
                // 2. Fetch user profile and cart immediately
                await loadUserProfile();
                
                // 3. Close the popup
                setShowLogin(false);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("An error occurred. Please check your credentials.");
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Login" ? <></> : 
                        <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your Name' required />
                    }

                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your Email' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Your Password' required />
                    
                    <button type='submit'>{currState === "Sign up" ? "Create account" : "Login"}</button>
                    
                    <div className="login-popup-condition">
                        <input type="checkbox" required />
                        <p>I agree to the Terms of Service and Privacy Policy</p>
                    </div>
                    {currState === "Login" 
                        ? <p>Create an account <span onClick={() => setCurrState("Sign up")}>Click Here</span></p>
                        : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login Here</span></p>
                    }
                </div>
            </form>
        </div>
    )
}

export default LoginPopup;