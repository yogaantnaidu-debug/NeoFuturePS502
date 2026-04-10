import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import Card from '../components/Card';
import { Target, Utensils, Activity as ActivityIcon, Moon } from 'lucide-react';

export default function OnboardingScreen({ onNext, userData, setUserData }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateData = (key, value) => {
    setUserData(prev => ({ ...prev, [key]: value }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="mb-2">Basic Details</h2>
            <p className="mb-6">Let's get to know you.</p>
            <div className="flex-col gap-4">
              <input type="text" placeholder="Full Name" value={userData.name || ''} onChange={(e) => updateData('name', e.target.value)} />
              <div className="flex gap-4">
                <input type="number" placeholder="Age" className="w-full" value={userData.age || ''} onChange={(e) => updateData('age', e.target.value)} />
                <select className="w-full" value={userData.gender || ''} onChange={(e) => updateData('gender', e.target.value)}>
                  <option value="" disabled>Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-4">
                 <input type="number" placeholder="Height (cm)" className="w-full" value={userData.height || ''} onChange={(e) => updateData('height', e.target.value)} />
                 <input type="number" placeholder="Weight (kg)" className="w-full" value={userData.weight || ''} onChange={(e) => updateData('weight', e.target.value)} />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="mb-2">Your Fitness Goal</h2>
            <p className="mb-6">What do you want to achieve?</p>
            <div className="flex-col gap-3">
              {[
                { id: 'Fat Loss', desc: 'Burn fat and get leaner' },
                { id: 'Muscle Gain', desc: 'Build muscle and strength' },
                { id: 'Maintain', desc: 'Stay active and healthy' },
              ].map((goal) => (
                <Card 
                  key={goal.id} 
                  title={goal.id} 
                  description={goal.desc} 
                  icon={Target}
                  isSelected={userData.goal === goal.id}
                  onClick={() => updateData('goal', goal.id)}
                />
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="mb-2">Diet & Activity</h2>
            <p className="mb-6">Tell us about your lifestyle.</p>
            
            <h4 className="mb-2 mt-4 text-muted">Dietary Preference</h4>
            <div className="flex-col gap-3 mb-6">
              {['Veg', 'Vegan', 'Non-Veg'].map((diet) => (
                <Card 
                  key={diet} 
                  title={diet} 
                  icon={Utensils}
                  isSelected={userData.diet === diet}
                  onClick={() => updateData('diet', diet)}
                />
              ))}
            </div>

            <h4 className="mb-2 text-muted">Activity Level</h4>
            <div className="flex-col gap-3">
              {['Sedentary', 'Moderate', 'Active'].map((level) => (
                <Card 
                  key={level} 
                  title={level} 
                  icon={ActivityIcon}
                  isSelected={userData.activity === level}
                  onClick={() => updateData('activity', level)}
                />
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="mb-2">Sleep Routine</h2>
            <p className="mb-6">Quality sleep is crucial for progress.</p>
            <div className="flex-col gap-3">
              {[
                { id: '< 6 hours', desc: 'I need to sleep more' },
                { id: '6-8 hours', desc: 'Average healthy sleep' },
                { id: '8+ hours', desc: 'Well rested daily' },
              ].map((sleep) => (
                <Card 
                  key={sleep.id} 
                  title={sleep.id} 
                  description={sleep.desc}
                  icon={Moon}
                  isSelected={userData.sleep === sleep.id}
                  onClick={() => updateData('sleep', sleep.id)}
                />
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="screen-container">
      <ProgressBar currentStep={step} totalSteps={totalSteps} />
      
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      <div className="bottom-action flex gap-4">
        {step > 1 && (
          <Button onClick={handleBack} variant="secondary" className="w-full">
            Back
          </Button>
        )}
        <Button onClick={handleNext} variant="primary" className="w-full">
          {step === totalSteps ? 'Continue' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
