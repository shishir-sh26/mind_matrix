"use client";

import { Dumbbell } from "lucide-react";

export default function Exercises() {
  return (
    <div className="flex flex-col min-h-screen bg-[#091212] font-sans text-white px-5 pt-12 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#13ecec20] rounded-full flex justify-center items-center">
          <Dumbbell color="#13ecec" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white m-0 tracking-tight">Exercises</h1>
      </div>

      <div className="flex-1 flex justify-center items-center text-center opacity-60">
        <p className="text-[#94a3b8] text-base">
          Your saved exercise routines will appear here.
        </p>
      </div>
    </div>
  );
}
