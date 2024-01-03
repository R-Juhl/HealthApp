// LanguageManager.js
import React, { useEffect, useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import UserIdContext from '../contexts/UserIdContext';

const LanguageManager = ({ children }) => {
  const { isLoggedIn, loggedInUserId } = useContext(UserIdContext);
  const { setLanguage } = useContext(LanguageContext);

  useEffect(() => {
    const fetchLanguagePreference = async () => {
      if (isLoggedIn && loggedInUserId) {
        try {
          const response = await fetch('http://localhost:5000/get_language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: loggedInUserId })
          });
          const data = await response.json();
          if (response.ok) {
            setLanguage(data.language);
          } else {
            console.error('Error fetching language preference:', data.error);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    fetchLanguagePreference();
  }, [isLoggedIn, loggedInUserId, setLanguage]);

  return <>{children}</>;
};

export default LanguageManager;
