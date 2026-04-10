import React from 'react';
import { motion } from 'framer-motion';
import { Mail, LogIn, Activity } from 'lucide-react';
import Button from '../components/Button';

export default function LoginScreen({ onNext }) {
  return (
    <motion.div
      className="screen-container justify-center items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full flex-col items-center text-center">
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div style={{
            background: 'var(--primary-glow)',
            padding: '1.5rem',
            borderRadius: '50%',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            <Activity size={48} className="text-primary" />
          </div>
          <h1 className="mb-2">VitalAI</h1>
          <p>Your personalized health journey starts here.</p>
        </motion.div>

        <div className="w-full flex-col gap-4 mt-4">
          <Button onClick={onNext} variant="primary" icon={Mail}>
            Continue with Email
          </Button>
          <Button onClick={onNext} variant="secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" className="btn-icon">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        <p className="mt-8 text-muted" style={{ fontSize: '0.875rem' }}>
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </motion.div>
  );
}
