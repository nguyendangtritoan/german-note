import React from 'react';

const Button = React.forwardRef(({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    google: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400"
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-base", lg: "px-6 py-3 text-lg", icon: "p-2" };
  
  return (
    <button ref={ref} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
});

export default Button;