//MainContent.js
import React from 'react';

import Header from './Header';
import Welcome from './Welcome';
//import Intro from './Intro';

import Home from './Home';
import Bot from './Bot';
import Threads from './Threads';
import Health from './Health';
import Training from './Training';
import Nutrition from './Nutrition';
import Profile from './Profile';

const MainContent = ({ currentView, setCurrentView, selectedThreadId, setSelectedThreadId }) => {

    const handleTabClick = (tabName) => {
        if (currentView === 'Bot' && tabName !== 'Bot') {
          setSelectedThreadId(null); // Reset selected thread ID when navigating away from Bot
        }
        setCurrentView(tabName);
      };

    const renderContent = () => {
        switch (currentView) {
            case 'Home':
                return <Home />;
            case 'Bot':
                return <Bot
                    selectedThreadId={selectedThreadId}
                    setSelectedThreadId={setSelectedThreadId}
                />;
            case 'Threads':
                return <Threads
                    setCurrentView={setCurrentView}
                    setSelectedThreadId={setSelectedThreadId}
                />;
            case 'HealthMarkers':
                return <Health />;
            case 'TrainingProgram':
                return <Training />;
            case 'Nutrition':
                return <Nutrition />;
            case 'Profile':
                return <Profile />;
            default:
                return <Welcome />;
        }
    };

    return (
        <div className="Main-container">

            <Header 
              onTabClick={handleTabClick}
              currentView={currentView}
            />

            {renderContent()}

        </div>
    );
};

export default MainContent;
