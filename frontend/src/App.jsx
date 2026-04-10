import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PermissionsScreen from './screens/PermissionsScreen';
import PersonalityScreen from './screens/PersonalityScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    diet: '',
    activity: '',
    sleep: '',
    aiPersonality: ''
  });

  const handleCompleteFlow = () => {
    // In a real app, this is where you'd send `userData` to your backend API
    console.log("Onboarding Complete! Data ready for backend payload:", userData);
    alert(JSON.stringify(userData, null, 2));
    // Reset or go to Main App Dashboard
    setCurrentScreen('login');
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'login' && (
        <LoginScreen key="login" onNext={() => setCurrentScreen('onboarding')} />
      )}
      {currentScreen === 'onboarding' && (
        <OnboardingScreen 
          key="onboarding" 
          onNext={() => setCurrentScreen('permissions')}
          userData={userData}
          setUserData={setUserData}
        />
      )}
      {currentScreen === 'permissions' && (
        <PermissionsScreen key="permissions" onNext={() => setCurrentScreen('personality')} />
      )}
      {currentScreen === 'personality' && (
        <PersonalityScreen 
          key="personality" 
          onComplete={handleCompleteFlow}
          userData={userData}
          setUserData={setUserData}
        />
      )}
    </AnimatePresence>
  );
}

export default App;
