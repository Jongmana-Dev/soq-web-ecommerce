import * as React from "react";
import { cn } from "@/lib/utils";

// ❗ เปลี่ยนจาก interface → type
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full min-h-[96px] rounded-[10px] border border-input bg-background px-3.5 py-2.5 text-[15px] shadow-sm",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30 focus-visible:border-[#007AFF]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };