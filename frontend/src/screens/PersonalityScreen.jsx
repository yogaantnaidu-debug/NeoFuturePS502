import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { Smile, Flame, Sparkles, LineChart } from 'lucide-react';

export default function PersonalityScreen({ onComplete, userData, setUserData }) {
  const [selected, setSelected] = useState(userData.aiPersonality || 'Friendly Buddy');

  const personalities = [
    {
      id: 'Friendly Buddy',
      desc: 'Casual, supportive, and fun.',
      example: '"You crushed it today! Let\'s keep this momentum going!"',
      icon: Smile
    },
    {
      id: 'Strict Coach',
      desc: 'Disciplined, pushes you hard.',
      example: '"No excuses. Give me 10 more reps. You can rest when you\'re done."',
      icon: Flame
    },
    {
      id: 'Motivational Mentor',
      desc: 'Inspiring and goal-focused.',
      example: '"Every step is progress towards your best self. Believe it."',
      icon: Sparkles
    },
    {
      id: 'Data Analyst',
      desc: 'Logical, numbers & insights driven.',
      example: '"Your heart rate variability improved by 4% this week. Optimal for recovery."',
      icon: LineChart
    }
  ];

  const handleFinish = () => {
    setUserData(prev => ({ ...prev, aiPersonality: selected }));
    onComplete();
  };

  return (
    <motion.div
      className="screen-container"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="mb-6">
        <h2 className="mb-2">Choose Your AI</h2>
        <p>Select how you want your VitalAI assistant to behave. You can change this later.</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
        <div className="flex-col gap-4">
          {personalities.map((p) => (
            <motion.div 
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(p.id)}
              style={{
                background: selected === p.id ? 'var(--card-bg-active)' : 'var(--card-bg)',
                border: `1px solid ${selected === p.id ? 'var(--card-border-active)' : 'var(--border-color)'}`,
                borderRadius: '1rem',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex gap-3 mb-2 items-center">
                <p.icon size={20} className={selected === p.id ? 'text-primary' : 'text-muted'} />
                <h3 style={{ fontSize: '1.125rem' }}>{p.id}</h3>
              </div>
              <p className="mb-3" style={{ fontSize: '0.875rem' }}>{p.desc}</p>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontStyle: 'italic',
                fontSize: '0.875rem',
                color: 'var(--text-color)'
              }}>
                {p.example}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bottom-action mt-4">
        <Button onClick={handleFinish} variant="primary">
          Complete Setup
        </Button>
      </div>
    </motion.div>
  );
}
