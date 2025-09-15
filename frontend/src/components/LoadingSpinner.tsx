import React from 'react';
import { Loader } from '@mantine/core';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '', color }) => {
  return (
    <Loader size={size} className={className} color={color} data-testid="loading-spinner" />
  );
};

export default LoadingSpinner;