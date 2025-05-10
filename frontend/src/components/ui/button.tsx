import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'default';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    default: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
  };

  const buttonClass = classNames(baseStyle, variants[variant], className);

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};
