import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import api from '../../api/axios';

const LoginPopup = ({ setShowLogin }) => {
  const { setIsLoggedIn, loadUserProfile } = useContext(StoreContext);

  const [currState, setCurrState] = useState("login"); // login/register
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();

    let endpoint = currState === "login" ? "/api/user/login" : "/api/user/register";
    let payload = currState === "login" 
                  ? { email: data.email, password: data.password } 
                  : data;

    try {
      const response = await api.post(endpoint, payload);
      
      if (response.data.success) {
        setIsLoggedIn(true);
        await loadUserProfile();
        setShowLogin(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState === "login" ? "Login" : "Sign Up"}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>

        <div className="login-popup-inputs">
          {currState === "register" && (
            <input 
              name='name' 
              onChange={onChangeHandler} 
              value={data.name} 
              type="text" 
              placeholder='Your Name' 
              required 
            />
          )}

          <input 
            name='email' 
            onChange={onChangeHandler} 
            value={data.email} 
            type="email" 
            placeholder='Your Email' 
            required 
          />
          <input 
            name='password' 
            onChange={onChangeHandler} 
            value={data.password} 
            type="password" 
            placeholder='Your Password' 
            required 
          />

          {currState === "register" && (
            <div className="login-popup-condition">
              <input type="checkbox" required />
              <p>I agree to the Terms of Service and Privacy Policy</p>
            </div>
          )}

          <button type='submit'>{currState === "login" ? "Login" : "Create account"}</button>

          <p>
            {currState === "login" 
              ? <>Create an account <span onClick={() => setCurrState("register")}>Click Here</span></>
              : <>Already have an account? <span onClick={() => setCurrState("login")}>Login Here</span></>
            }
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPopup;
