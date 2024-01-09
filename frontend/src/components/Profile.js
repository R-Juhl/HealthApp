// Profile.js
import React, { useState, useEffect, useContext } from 'react';
import UserIdContext from '../contexts/UserIdContext';
import './Profile.css';

function Profile() {
    const { loggedInUserId, currentUser } = useContext(UserIdContext);
    const [profileData, setProfileData] = useState({
        age: '',
        height: '',
        fitnessLevel: 5,
        dietaryRestrictions: '',
        healthConditions: '',
        goals: { longevity: false, athletic: false, weightLoss: false, mobility: false },
        additionalGoals: '',
        heightUnit: 'cm'
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            // Fetch profile data from server
            const response = await fetch('http://localhost:5000/get_user_profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: loggedInUserId })
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Error fetching profile data:', data.error);
                return;
            }
            // Update state with fetched data
            setProfileData({
                ...profileData,
                age: data.age || '',
                height: data.height || '',
                fitnessLevel: data.fitness_level || 5,
                dietaryRestrictions: data.dietary_restrictions || '',
                healthConditions: data.health_conditions || '',
                goals: data.goals || { longevity: false, athletic: false, weightLoss: false, mobility: false },
                additionalGoals: data.goals?.additionalGoals || '',
                heightUnit: data.height_unit || 'cm',
            });
        };
      
        if (loggedInUserId) {
            fetchProfileData();
        }
    }, [loggedInUserId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setProfileData(prevData => ({
            ...prevData,
            goals: { ...prevData.goals, [name]: checked }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Combine goals and additionalGoals
        const submissionData = {
            ...profileData,
            goals: { ...profileData.goals, additionalGoals: profileData.additionalGoals }
        };
        // Send profile data to server
        const response = await fetch('http://localhost:5000/update_user_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: loggedInUserId, ...submissionData })
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('Error updating profile:', data.error);
            return;
        }
        alert('Profile updated successfully');
    };

    // Conditional Welcome Message
    const welcomeMessage = loggedInUserId ? (
        <p>Hi, {currentUser}. <br></br>Fill out your profile to get personalized recommendations.</p>
    ) : (
        <p>Log in to fill out your profile and get personalized recommendations.</p>
    );

    return (
        <div className="profile-container">
            <h1>Profile</h1>
            {welcomeMessage}
            <form onSubmit={handleSubmit}>

                {/* Age & Height Section */}
                <div className="section-box">
                    <label>Age & Height</label>
                    <div className="height-unit-section">
                        <input
                            type="number"
                            name="age"
                            placeholder="Age"
                            value={profileData.age}
                            onChange={handleInputChange}
                        />
                        <input
                            type="number"
                            name="height"
                            placeholder="Height"
                            value={profileData.height}
                            onChange={handleInputChange}
                        />
                        <label>
                            <input
                                type="radio"
                                name="heightUnit"
                                value="cm"
                                checked={profileData.heightUnit === 'cm'}
                                onChange={handleInputChange}
                            /> cm
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="heightUnit"
                                value="inches"
                                checked={profileData.heightUnit === 'inches'}
                                onChange={handleInputChange}
                            /> inches
                        </label>
                    </div>
                </div>

                {/* Fitness Level Section */}
                <div className="section-box">
                    <label>Overall Fitness Level</label>
                    <input
                        type="range"
                        name="fitnessLevel"
                        min="1"
                        max="10"
                        value={profileData.fitnessLevel}
                        onChange={handleInputChange}
                    />
                    {profileData.fitnessLevel}
                </div>

                {/* Dietary Restrictions Section */}
                <div className="section-box">
                    <label>Any Dietary Restrictions / Allergies</label>
                    <textarea
                        name="dietaryRestrictions"
                        placeholder="Dietary Restrictions / Allergies"
                        value={profileData.dietaryRestrictions}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Health Conditions Section */}
                <div className="section-box">
                    <label>Any Health Conditions or Diseases</label>
                    <textarea
                        name="healthConditions"
                        placeholder="Health Conditions/Diseases"
                        value={profileData.healthConditions}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Goals Section */}
                <div className="section-box">
                    <label>Your Goals and Ambitions</label>
                    <label>
                        <input
                            type="checkbox"
                            name="longevity"
                            checked={profileData.goals.longevity}
                            onChange={handleCheckboxChange}
                        /> Longevity
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="athletic"
                            checked={profileData.goals.athletic}
                            onChange={handleCheckboxChange}
                        /> Athletic Performance
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="weightLoss"
                            checked={profileData.goals.weightLoss}
                            onChange={handleCheckboxChange}
                        /> Weight Loss
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="mobility"
                            checked={profileData.goals.mobility}
                            onChange={handleCheckboxChange}
                        /> Mobility
                    </label>
                    <textarea
                        name="additionalGoals"
                        placeholder="Other Goals"
                        value={profileData.additionalGoals}
                        onChange={handleInputChange}
                    />
                </div>

                <button type="submit" disabled={!loggedInUserId}>Save</button>
            </form>
        </div>
    );
}

export default Profile;