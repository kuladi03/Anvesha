// components/ui/textarea.tsx
import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
}

export const Textarea = ({ id, ...props }: TextareaProps) => {
  return (
    <textarea
      id={id}
      {...props}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};
