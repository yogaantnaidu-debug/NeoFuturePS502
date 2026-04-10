import React from 'react';
import { motion } from 'framer-motion';
import './Button.css'; // Let's define button styles here

export default function Button({ children, onClick, variant = 'primary', className = '', type = 'button', icon: Icon }) {
  const baseClass = 'custom-btn';
  const variantClass = variant === 'outline' ? 'btn-outline' : variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {Icon && <Icon className="btn-icon" size={20} />}
      {children}
    </motion.button>
  );
}
