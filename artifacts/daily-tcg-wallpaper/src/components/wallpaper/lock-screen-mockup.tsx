import React, { useEffect, useState } from "react";
import { generateGradient } from "@/lib/generateGradient";

export function LockScreenMockup({ mood, style, id }: { mood: string; style: string; id: number }) {
  const gradient = generateGradient(mood, style, id);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[200px] mx-auto aspect-[9/19.5] rounded-[2.5rem] border-[6px] border-zinc-900 overflow-hidden relative shadow-2xl bg-black">
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      
      {/* Notch */}
      <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 rounded-b-3xl w-1/2 mx-auto z-10" />

      {/* Lock screen content */}
      <div className="relative z-10 pt-16 px-4 flex flex-col items-center text-white drop-shadow-md">
        <p className="text-5xl font-light tracking-tight">{time}</p>
        <p className="text-sm font-medium opacity-90 mt-2">{date}</p>
      </div>

      <div className="absolute bottom-8 inset-x-0 flex justify-between px-8 z-10">
        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-white/80" />
        </div>
        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-[1.5px] border-white/80 flex items-center justify-center">
             <div className="w-2 h-2 bg-white/80 rounded-full" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 inset-x-0 flex justify-center z-10">
        <div className="w-1/3 h-1 bg-white/80 rounded-full" />
      </div>
    </div>
  );
}
