// Profile.js
import React, { useState, useEffect, useContext } from 'react';
import UserIdContext from '../contexts/UserIdContext';
import './Profile.css';

function Profile() {
  const { loggedInUserId } = useContext(UserIdContext);
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
          setProfileData(data);  // Update state with fetched data
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

  const handleGoalChange = (event) => {
      const { checked, value } = event.target;
      setProfileData(prevData => ({
          ...prevData,
          goals: checked
              ? [...prevData.goals, value]
              : prevData.goals.filter(goal => goal !== value)
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

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <form onSubmit={handleSubmit}>
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
        <label>Fitness Level</label>
        <input
            type="range"
            name="fitnessLevel"
            min="1"
            max="10"
            value={profileData.fitnessLevel}
            onChange={handleInputChange}
        />
        <textarea
            name="dietaryRestrictions"
            placeholder="Dietary Restrictions / Allergies"
            value={profileData.dietaryRestrictions}
            onChange={handleInputChange}
        />
        <textarea
            name="healthConditions"
            placeholder="Health Conditions/Diseases"
            value={profileData.healthConditions}
            onChange={handleInputChange}
        />
        <div>
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
        </div>
        <textarea
            name="additionalGoals"
            placeholder="Other Goals"
            value={profileData.additionalGoals}
            onChange={handleInputChange}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default Profile;