// components/Progress.tsx

import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string; // Add className to the props
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  color = 'bg-blue-500',
  size = 'medium',
  className = '',
}) => {
  const progressValue = Math.min(Math.max(value, 0), max);
  const progressPercentage = (progressValue / max) * 100;

  const heightMap: { [key in 'small' | 'medium' | 'large']: string } = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  };

  const progressBarHeight = heightMap[size];

  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div
        className={`${progressBarHeight} ${color} rounded-full`}
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

export default Progress;
