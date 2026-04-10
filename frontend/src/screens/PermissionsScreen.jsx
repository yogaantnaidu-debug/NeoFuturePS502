import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { Bell, HeartPulse, MapPin } from 'lucide-react';

export default function PermissionsScreen({ onNext }) {
  return (
    <motion.div
      className="screen-container"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="mb-8">
        <h2 className="mb-2">Almost there!</h2>
        <p>We need a few permissions to provide the best AI guidance.</p>
      </div>

      <div className="flex-col gap-6 flex-1">
        
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-slate-800 rounded-full text-blue-400" style={{ background: 'var(--bg-color-alt)', color: 'var(--primary-color)' }}>
            <Bell size={24} />
          </div>
          <div>
            <h4 className="mb-1">Notifications</h4>
            <p className="text-sm" style={{ fontSize: '0.875rem' }}>Allow us to send friendly reminders and keep you accountable to your goals.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="p-3 bg-slate-800 rounded-full text-emerald-400" style={{ background: 'var(--bg-color-alt)', color: 'var(--success-color)' }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <h4 className="mb-1">Health Data (Optional)</h4>
            <p className="text-sm" style={{ fontSize: '0.875rem' }}>Connect Apple Health or Google Fit to precisely track your caloric burn and steps.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="p-3 bg-slate-800 rounded-full text-purple-400" style={{ background: 'var(--bg-color-alt)', color: '#c084fc' }}>
            <MapPin size={24} />
          </div>
          <div>
            <h4 className="mb-1">Location (Optional)</h4>
            <p className="text-sm" style={{ fontSize: '0.875rem' }}>Used to suggest running routes and local healthy dining options.</p>
          </div>
        </div>

      </div>

      <div className="bottom-action flex-col gap-4">
        <Button onClick={onNext} variant="primary">
          Allow Permissions
        </Button>
        <Button onClick={onNext} variant="outline">
          Skip for now
        </Button>
      </div>
    </motion.div>
  );
}
