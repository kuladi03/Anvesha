// components/ui/Tabs.tsx
import { FC, ReactNode } from "react";

// Tabs wrapper
interface TabsProps {
  children: ReactNode;
  value:string;
  onValueChange: (value: string) => void;
  className?: string;
}
export const Tabs: FC<TabsProps> = ({ children, className }) => {
  return <div className={`space-y-4 ${className || ""}`}>{children}</div>;
};

// TabsList
interface TabsListProps {
  children: ReactNode;
  className?: string;
}
export const TabsList: FC<TabsListProps> = ({ children, className }) => {
  return (
    <div
      className={`flex items-center space-x-2 border-b border-gray-200 ${className || ""}`}
    >
      {children}
    </div>
  );
};

// TabsTrigger
interface TabsTriggerProps {
  children: ReactNode;
  value: string;
  isSelected: boolean;
  onClick?: (value: string) => void;
  className?: string;
}
export const TabsTrigger: FC<TabsTriggerProps> = ({
  children,
  value,
  isSelected,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={() => onClick?.(value)}
      className={`px-4 py-2 text-sm font-medium transition duration-150 rounded-t-md
        ${
          isSelected
            ? "text-purple-600 bg-white border-b-2 border-purple-600"
            : "text-gray-600 hover:text-purple-600"
        }
        ${className || ""}
      `}
    >
      {children}
    </button>
  );
};

// TabsContent
interface TabsContentProps {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}
export const TabsContent: FC<TabsContentProps> = ({
  children,
  isActive,
  className,
}) => {
  return (
    <div className={`${isActive ? "block" : "hidden"} mt-4 ${className || ""}`}>
      {children}
    </div>
  );
};
