import React, { InputHTMLAttributes } from 'react';
import classNames from 'classnames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ type = 'text', className, ...props }) => {
  const inputClass = classNames(
    'px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    className
  );

  return <input type={type} className={inputClass} {...props} />;
};
