// src/components/ConditionBadge.jsx
import React from 'react';
import { CONDITION_LABELS } from '../config/cedimart';

const ConditionBadge = ({ condition }) => {
  const cfg = CONDITION_LABELS[condition] || { label: condition, color: '#616161', bg: '#F5F5F5' };
  
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

export default ConditionBadge;