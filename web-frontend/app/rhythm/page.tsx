"use client";

import { Fingerprint } from "lucide-react";

export default function RhythmTap() {
  return (
    <div className="flex flex-col min-h-screen bg-[#091212] font-sans text-white px-5 pt-12 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#f8717120] rounded-full flex justify-center items-center">
          <Fingerprint color="#f87171" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white m-0 tracking-tight">Rhythm Tap</h1>
          <p className="text-[#f87171] text-sm font-semibold tracking-wide m-0">
            Grounding Exercise
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center opacity-60">
        <Fingerprint color="#64748b" size={64} className="mb-4" />
        <p className="text-[#94a3b8] text-base max-w-[250px]">
          Tap to the rhythm to ground yourself during overwhelming moments.
        </p>
        <p className="text-[#475569] text-xs font-bold tracking-[2px] mt-8">
          COMING SOON
        </p>
      </div>
    </div>
  );
}
