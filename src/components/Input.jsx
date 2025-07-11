import React from 'react';
export const Input = React.forwardRef(({ className, type, ...props }, ref) = (
  input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background fileborder-0 filebg-transparent filetext-sm filefont-medium placeholdertext-muted-foreground focus-visibleoutline-none focus-visiblering-2 focus-visiblering-ring focus-visiblering-offset-2 disabledcursor-not-allowed disabledopacity-50 ${className}`}
    ref={ref}
    {...props}
  
));