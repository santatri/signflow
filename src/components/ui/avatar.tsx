"use client";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils/cn";

export function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}
export function AvatarImage(props: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className="aspect-square h-full w-full" {...props} />;
}
export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn("flex h-full w-full items-center justify-center bg-primary-soft text-sm font-medium text-primary", className)}
      {...props}
    />
  );
}
