
import { cn } from "@/lib/utils";
import React from "react";

interface StandaloneFormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const StandaloneFormDescription = React.forwardRef<
  HTMLParagraphElement, 
  StandaloneFormDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});

StandaloneFormDescription.displayName = "StandaloneFormDescription";

export { StandaloneFormDescription };
