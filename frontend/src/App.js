// App.js
import React, { useState } from 'react';
import './App.css';
import Modal from 'react-modal';

import { LanguageProvider } from './contexts/LanguageContext';
import LanguageManager from './contexts/LanguageManager';
import { UserIdProvider } from './contexts/UserIdContext';

// Import components
import MainContent from './components/MainContent';

Modal.setAppElement('#root');

function App() {
  const [currentView, setCurrentView] = useState('Welcome');
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  return (
    <UserIdProvider setCurrentView={setCurrentView}>
      <LanguageProvider>
        <LanguageManager>
          <div>

            <div className="App">

              <MainContent
                currentView={currentView}
                setCurrentView={setCurrentView}
                selectedThreadId={selectedThreadId}
                setSelectedThreadId={setSelectedThreadId} 
              />



            </div>
          </div>
        </LanguageManager>
      </LanguageProvider>
    </UserIdProvider>
  );
}

export default App;