//MainContent.js
import React from 'react';

import Header from './Header';
import Welcome from './Welcome';

const MainContent = ({ setCurrentView }) => {

    const handleTabClick = (tabName) => {
        setCurrentView(tabName);
    
        switch (tabName) {
            case 'Bot':
                setCurrentView('Bot');
                break;
            case 'Threads':
                setCurrentView('Threads');
                break;
            case 'HealthMarkers':
                setCurrentView('HealthMarkers');
                break;
            case 'TrainingProgram':
                setCurrentView('TrainingProgram');
                break;
            case 'Nutrition':
                setCurrentView('Nutrition');
                break;
            case 'Profile':
                setCurrentView('Profile');
                break;
            // Add more cases for other tabs as needed
            default:
                break;
        }
    };

    return (
        <div className="Main-container">

            <Header 
              onTabClick={handleTabClick}
            />

            <Welcome />

        </div>
    );
};

export default MainContent;
