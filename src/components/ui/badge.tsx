import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-red-700 text-white hover:bg-red-800": variant === "default",
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
          "border-gray-300 text-gray-700": variant === "outline",
          "border-transparent bg-red-100 text-red-700": variant === "destructive",
          "border-transparent bg-green-100 text-green-700": variant === "success",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
