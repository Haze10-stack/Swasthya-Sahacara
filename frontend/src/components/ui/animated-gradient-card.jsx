// components/ui/animated-gradient-card.tsx
"use client";
import { cn } from "@/utils/cn";

export const AnimatedCard = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "h-full w-full bg-transparent rounded-2xl p-[1px] relative",
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse [animation-duration:_3s]" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-purple-500/40 to-transparent blur-xl" />
      <div className="relative h-full w-full bg-zinc-900 rounded-2xl p-4">
        {children}
      </div>
    </div>
  );
};