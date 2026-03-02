"use client";

import { useState, useEffect } from "react";
import { X, Settings } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BreatheExercise() {
  const router = useRouter();
  const [phase, setPhase] = useState<"Inhale" | "Exhale">("Inhale");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [phaseTime, setPhaseTime] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase((prev) => (prev === "Inhale" ? "Exhale" : "Inhale"));
      setPhaseTime(4);
    }, 4000);

    const countdown = setInterval(() => {
      setPhaseTime((prev) => (prev > 1 ? prev - 1 : 4));
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(countdown);
    };
  }, [phase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const totalTimeStr = formatTime(300 - timeLeft);
  const remainingTimeStr = formatTime(timeLeft);
  const progress = ((300 - timeLeft) / 300) * 100;
  const isInhaling = phase === "Inhale";

  return (
    <div className="flex flex-col min-h-screen bg-[#090919] font-sans text-white">
      {/* Header */}
      <div className="flex justify-between items-center pt-12 px-5 mb-8">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-[#1e1e2d] flex justify-center items-center border-none cursor-pointer hover:bg-[#2d2d3f] transition-colors"
        >
          <X color="white" size={24} />
        </button>
        <span className="text-base font-bold tracking-wide">Breathe with Me</span>
        <button className="w-10 h-10 flex justify-center items-center border-none bg-transparent cursor-pointer">
          <Settings color="white" size={20} />
        </button>
      </div>

      {/* Center Circle */}
      <div className="flex-1 flex flex-col justify-center items-center px-10 relative">
        <div className="relative w-[280px] h-[280px] mb-20 flex justify-center items-center">
          <motion.div
            animate={{
              scale: isInhaling ? 1.5 : 1,
              opacity: isInhaling ? 1 : 0.6,
            }}
            transition={{
              duration: 4,
              ease: [0.42, 0, 0.58, 1], // easeInOut equivalent to mobile Custom bezier
            }}
            className="absolute rounded-full bg-[#7c3aed] shadow-[0_0_40px_rgba(124,58,237,0.5)] flex justify-center items-center w-full h-full"
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <span className="text-white text-5xl font-light mb-1">{phase}</span>
              <span className="text-white/60 text-xs font-bold tracking-[1px]">
                {phaseTime} SECONDS
              </span>
            </div>
          </motion.div>
        </div>

        <p className="text-[#94a3b8] text-center leading-relaxed text-[15px] max-w-[280px]">
          Focus on the expanding circle and let the gentle vibration guide your breath.
        </p>
      </div>

      {/* Footer */}
      <div className="pb-10 px-10 flex flex-col">
        <div className="flex justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-[#475569] text-[10px] font-bold tracking-[1px] mb-1">TOTAL TIME</span>
            <span className="text-white text-xl font-light">{totalTimeStr}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#475569] text-[10px] font-bold tracking-[1px] mb-1">REMAINING</span>
            <span className="text-white text-xl font-light">{remainingTimeStr}</span>
          </div>
        </div>

        <div className="h-1.5 bg-[#1e1e2d] rounded-full mb-10 overflow-hidden">
          <motion.div 
            className="h-full bg-[#7c3aed]" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>

        <button 
          onClick={() => router.back()}
          className="self-center bg-[#1e1e2d] px-6 py-3 rounded-full border border-white/10 flex items-center gap-2.5 cursor-pointer hover:bg-[#2d2d3f] transition-colors"
        >
          <div className="w-3.5 h-3.5 rounded-full border-[3px] border-[#64748b]" />
          <span className="text-[#64748b] text-[15px] font-semibold">End Session</span>
        </button>
      </div>
    </div>
  );
}
