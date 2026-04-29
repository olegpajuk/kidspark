"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  "aria-required"?: boolean;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, checked, onCheckedChange, className, disabled, ...props }, ref) => {
    return (
      <BaseCheckbox.Root
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(c) => onCheckedChange?.(c === true)}
        disabled={disabled}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded-md border-2 border-gray-300 bg-white transition-colors",
          "data-[checked]:border-gray-800 data-[checked]:bg-gray-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <BaseCheckbox.Indicator className="flex items-center justify-center text-white">
          <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
