import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isIconOnly = size === "icon";

    // Determine if this button should get the full custom yellow/pink styling
    const isFullCustomButton =
      !asChild && !isIconOnly && variant === "default" && size === "default"; // Example: only default variant/size gets full custom

    if (isFullCustomButton) {
      // This button gets the .custom-Review4it-button class which includes its specific shadow, border, etc.
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size }),
            "custom-Review4it-button",
            className
          )}
          ref={ref}
          {...props}
        >
          <div className="bgContainer">
            <span>{children}</span>
          </div>
          <div className="arrowContainer">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12H19" />
              <path d="M12 5L19 12L12 19" />
            </svg>
          </div>
        </Comp>
      );
    } else {
      // These are standard ShadCN buttons (asChild, iconOnly, or other variants/sizes)
      // They should get the general-button-shadow.
      // If it's a link, we might not want the shadow, or a very subtle one.
      const isLinkVariant = variant === "link";
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            !isLinkVariant && "general-button-shadow" // Apply shadow unless it's a link
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
