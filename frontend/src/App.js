import React, { useState } from 'react';
import './App.css';

import { LanguageProvider } from './contexts/LanguageContext';
import LanguageManager from './contexts/LanguageManager';
import { UserIdProvider } from './contexts/UserIdContext';

// Import components
import MainContent from './components/MainContent';

function App() {
  const [currentView, setCurrentView] = useState('Welcome');

  return (
    <UserIdProvider setCurrentView={setCurrentView}>
      <LanguageProvider>
        <LanguageManager>
          <div>

            <div className="App">

              <MainContent
                currentView={currentView}
                setCurrentView={setCurrentView}
              />

            </div>
          </div>
        </LanguageManager>
      </LanguageProvider>
    </UserIdProvider>
  );
}

export default App;