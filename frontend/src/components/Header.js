// Header.js
import React, { useState, useContext } from 'react';
import Modal from 'react-modal';
import './Header.css';
import './Header_modals.css';
import { useLanguage } from '../contexts/LanguageContext';
import en from '../languages/en.json';
import dk from '../languages/dk.json';
import UserIdContext from '../contexts/UserIdContext';

import { HiCollection, HiFingerPrint, HiUser } from "react-icons/hi";
import { RiRobot2Fill } from "react-icons/ri";
import { GiWeightLiftingUp } from "react-icons/gi";
import { LuBeef } from "react-icons/lu";

/* Use later
<HiMenuAlt2 />
<HiOutlineMoon />
<HiLightBulb />
*/

function Header({ onTabClick }) {
  const { handleLogin, handleLogout, isLoggedIn, currentUser } = useContext(UserIdContext);
  const { language } = useLanguage();
  const text = language === 'en' ? en : dk;
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userData, setUserData] = useState({ name: '', surname: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signUpError, setSignUpError] = useState('');
  const [loginError, setLoginError] = useState('');

  // Handle change for sign-up and login forms
  const handleChange = (e, formType) => {
    if (formType === 'signup') {
      setUserData({ ...userData, [e.target.name]: e.target.value });
    } else {
      setLoginData({ ...loginData, [e.target.name]: e.target.value });
    }
  };

  const isPasswordComplex = (password) => {
    const hasMinLength = password.length >= 8;
    const hasCapitalLetter = /[A-Z]/.test(password);
    return hasMinLength && hasCapitalLetter;
  };

  // Handle user sign-up
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordComplex(userData.password)) {
      setSignUpError(text.headerModalSignuppasswordError);
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/create_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      await response.json();
      setUserData({ name: '', surname: '', email: '', password: '' });
      setShowSignUp(false);
      setSignUpError('');
    } catch (error) {
      console.error('Error:', error);
      setSignUpError(text.headerModalSignupError);
    }
  };

  // Handle user login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(loginData); // Call handleLogin from App.js
    setShowLogin(false); // Close the login modal after login attempt
  };

  // Clear errors when the modals are closed
  const closeModal = (modalType) => {
    if (modalType === 'signUp') {
      setShowSignUp(false);
      setSignUpError(''); // Clear sign-up error
    } else if (modalType === 'login') {
      setShowLogin(false);
      setLoginError(''); // Clear login error
    } else if (modalType === '') {
      setShowSignUp(false);
      setSignUpError('');
      setShowLogin(false);
      setLoginError('');
    }
  };
  
  return (
    <div className="header">
      <div className="header-left">
        <button className="tab-button" onClick={() => onTabClick('Bot')}>
          <RiRobot2Fill />
          <span className="tooltip-text">{text.tabsBotTitle}</span>
        </button>
        <button className="tab-button" onClick={() => onTabClick('Threads')}>
          <HiCollection />
          <span className="tooltip-text">{text.tabsThreadsTitle}</span>
        </button>
        <button className="tab-button" onClick={() => onTabClick('HealthMarkers')}>
          <HiFingerPrint />
          <span className="tooltip-text">{text.tabsHealthmarkersTitle}</span>
        </button>
        <button className="tab-button" onClick={() => onTabClick('TrainingProgram')}>
          <GiWeightLiftingUp />
          <span className="tooltip-text">{text.tabsTrainingprogramTitle}</span>
        </button>
        <button className="tab-button" onClick={() => onTabClick('Nutrition')}>
          <LuBeef />
          <span className="tooltip-text">{text.tabsNutritionTitle}</span>
        </button>
        <button className="tab-button" onClick={() => onTabClick('Profile')}>
          <HiUser />
          <span className="tooltip-text">{text.tabsProfileTitle}</span>
        </button>
      </div>

      <div className="header-right">
        <div className="user-display"> {currentUser}</div>
        <div className="button-group">
        <button className="header-button" onClick={() => setShowSignUp(true)}>{text.headerSignup}</button>
          {isLoggedIn ? (
            <button className="header-button" onClick={handleLogout}>{text.headerLogout}</button>
          ) : (
            <button className="header-button" onClick={() => setShowLogin(true)}>{text.headerLogin}</button>
          )}
        </div>
      </div>
      {/* Sign-Up Modal */}
      <Modal 
        className="modal" 
        isOpen={showSignUp} 
        onRequestClose={() => closeModal('signUp')}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark semi-transparent background
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }
        }}
      >
        <h2>{text.headerModalSignuptitle}</h2>
        <form onSubmit={handleSignUpSubmit}>
          <input type="text" name="name" placeholder={text.headerModalName} onChange={(e) => handleChange(e, 'signup')} value={userData.name} />
          <input type="text" name="surname" placeholder={text.headerModalSurname} onChange={(e) => handleChange(e, 'signup')} value={userData.surname} />
          <input type="email" name="email" placeholder={text.headerModalEmail} onChange={(e) => handleChange(e, 'signup')} value={userData.email} />
          <input type="password" name="password" placeholder={text.headerModalPassword} onChange={(e) => handleChange(e, 'signup')} value={userData.password} />
          <button type="submit">{text.headerModalCreateuserButton}</button>
        </form>
        <button onClick={() => closeModal('')}>{text.globalCloseButton}</button>
        {signUpError && <p>{signUpError}</p>}
      </Modal>

      {/* Login Modal */}
      <Modal 
        className="modal" 
        isOpen={showLogin} 
        onRequestClose={() => closeModal('login')}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark semi-transparent background
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }
        }}
      >
        <h2>{text.headerModalLogintitle}</h2>
        <form onSubmit={handleLoginSubmit}>
          <input type="email" name="email" placeholder={text.headerModalEmail} onChange={(e) => handleChange(e, 'login')} value={loginData.email} />
          <input type="password" name="password" placeholder={text.headerModalPassword} onChange={(e) => handleChange(e, 'login')} value={loginData.password} />
          <button type="submit">{text.headerModalLoginButton}</button>
        </form>
        <button onClick={() => closeModal('')}>{text.globalCloseButton}</button>
        {loginError && <p>{loginError}</p>}
      </Modal>

    </div>
  );
}

export default Header;