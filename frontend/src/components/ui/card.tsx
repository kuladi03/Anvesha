import { ReactNode, forwardRef, HTMLAttributes } from "react";

// Base Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 border-b border-gray-100 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

// Card Title
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({ children, className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-tight tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

// Card Description
interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  className?: string;
}
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ children, className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-600 ${className}`}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

// Card Content
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = "CardContent";

// Optional: Card Footer
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";
