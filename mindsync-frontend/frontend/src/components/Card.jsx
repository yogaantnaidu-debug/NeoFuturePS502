import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

export default function Card({ title, description, icon: Icon, isSelected, onClick, className = '' }) {
  return (
    <motion.div
      className={`custom-card ${isSelected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="card-content">
        {Icon && <Icon className={`card-icon ${isSelected ? 'text-primary' : 'text-muted'}`} size={24} />}
        <div className="card-text">
          <h3 className="card-title">{title}</h3>
          {description && <p className="card-description">{description}</p>}
        </div>
      </div>
      <div className={`card-radio ${isSelected ? 'active' : ''}`}>
        {isSelected && <motion.div layoutId="radio" className="radio-inner" />}
      </div>
    </motion.div>
  );
}
