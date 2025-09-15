import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-lg font-medium transition focus:outline-none",
          // Variants
          variant === "default" && "bg-black text-white hover:bg-gray-800",
          variant === "outline" && "border border-black text-black hover:bg-gray-100",
          variant === "ghost" && "text-gray-600 hover:bg-gray-100",
          // Sizes
          size === "sm" && "px-2 py-1 text-sm",
          size === "md" && "px-4 py-2 text-base",
          size === "lg" && "px-6 py-3 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
