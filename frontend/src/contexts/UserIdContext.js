// UserIdContext.js
import React, { useState, useEffect, useCallback } from 'react';

const UserIdContext = React.createContext();

export const UserIdProvider = ({ children, setCurrentView }) => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('Not logged in');
  const [userVersion, setUserVersion] = useState(null);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/verify_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (response.ok) {
          setLoggedInUserId(data.user_id);
          setCurrentUser(data.user);
          setUserVersion(data.user_version);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setLoggedInUserId(null);
          setCurrentUser('Not logged in');
          setUserVersion(null);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsLoggedIn(false);
        setLoggedInUserId(null);
        setCurrentUser('Not logged in');
        setUserVersion(null);
      }
    } else {
      setIsLoggedIn(false);
      setLoggedInUserId(null);
      setCurrentUser('Not logged in');
      setUserVersion(null);
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleLogin = async (loginData) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user_id);
        verifyToken();
      } else {
        console.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setLoggedInUserId(null);
    setCurrentUser('Not logged in');
    setUserVersion(null);
  };

  const handleUserVersionSelect = async (version) => {
    // Update user version in backend
    const response = await fetch('http://localhost:5000/update_user_version', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: loggedInUserId, user_version: version })
    });
    const data = await response.json();
    if (data.message) {
      setUserVersion(version);
    } else {
      alert(data.error); // Replace with better error handling
    }
  };

  return (
    <UserIdContext.Provider value={{ 
      loggedInUserId,
      isLoggedIn,
      currentUser,
      userVersion,
      handleLogin,
      handleLogout,
      handleUserVersionSelect,
    }}>
      {children}
    </UserIdContext.Provider>
  );
};

export default UserIdContext;
