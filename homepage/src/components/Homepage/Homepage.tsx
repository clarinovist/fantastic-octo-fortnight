import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
}

export const Homepage: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-['Lato'] font-extrabold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#7000FE] text-white hover:bg-[#5b00cf] hover:shadow-lg hover:scale-105 active:scale-95",
    secondary: "bg-[#FECB00] text-[#3a0083] hover:bg-[#e5b700] hover:shadow-lg hover:scale-105 active:scale-95",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white/10 active:scale-95",
    ghost: "bg-transparent text-[#7000FE] hover:bg-[#7000FE]/10"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
