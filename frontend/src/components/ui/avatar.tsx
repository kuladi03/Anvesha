// components/ui/avatar.tsx
import { ReactNode } from 'react';

interface AvatarProps {
  children: ReactNode;
  className?: string;
}

export const Avatar = ({ children, className }: AvatarProps) => {
  return (
    <div className={`inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
};

export const AvatarImage = ({ alt }: { src: string; alt: string }) => {
  return ( 
    <div className="w-full h-[200px] relative aspect-w-16 aspect-h-9">
        <img src={`/avatar.png`} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
};

export const AvatarFallback = ({ children }: { children: ReactNode }) => {
  return <span className="text-white text-lg font-bold">{children}</span>;
};
