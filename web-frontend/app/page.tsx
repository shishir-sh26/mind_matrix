"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wind, 
  Leaf, 
  Target, 
  Smile, 
  ChevronRight, 
  Fingerprint, 
  Waves, 
  BriefcaseMedical, 
  Activity,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [activeMode, setActiveMode] = useState("BREATHE");

  return (
    <div className="flex flex-col min-h-screen bg-[#091212] px-5 pt-12 pb-24 font-sans text-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[10px] text-[#94a3b8] font-bold tracking-[2px] uppercase mb-1">
            Smart Toolkit
          </h2>
          <h1 className="text-[26px] font-extrabold m-0">Intervention</h1>
        </div>
        <div className="flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-full border border-white/5 shadow-lg">
          <span className="text-[#a78bfa] text-xs font-bold tracking-wide">
            Student Mode
          </span>
          <ChevronRight size={14} color="#64748b" />
        </div>
      </div>

      {/* Orb Visualization */}
      <div className="flex-1 flex justify-center items-center py-10 relative">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[280px] h-[280px] rounded-full border border-[#13ecec30] flex justify-center items-center"
        >
          <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#13ecec50] to-[#7c3aed30] blur-xl" />
        </motion.div>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-around items-center bg-[#1e293b] rounded-full mx-5 py-3 mb-10 shadow-xl border border-white/5 relative z-10">
        <ModeItem
          label="CALM"
          icon={Leaf}
          active={activeMode === "CALM"}
          onClick={() => setActiveMode("CALM")}
        />
        <ModeItem
          label="BREATHE"
          icon={Wind}
          active={activeMode === "BREATHE"}
          onClick={() => setActiveMode("BREATHE")}
        />
        <ModeItem
          label="FOCUS"
          icon={Target}
          active={activeMode === "FOCUS"}
          onClick={() => setActiveMode("FOCUS")}
        />
        <ModeItem
          label="RELEASE"
          icon={Smile}
          active={activeMode === "RELEASE"}
          onClick={() => setActiveMode("RELEASE")}
        />
      </div>

      {/* Interventions Matrix */}
      <div className="mt-2">
        <h3 className="text-[#94a3b8] text-sm font-semibold mb-4 tracking-wide">
          Quick Interventions
        </h3>
        
        <div className="flex flex-col gap-3">
          <InterventionCard
            title="Breathe with Me"
            desc="Haptic-sync breathing guide."
            icon={Waves}
            route="/breathe"
            color="#13ecec"
          />
          <InterventionCard
            title="Clear the Space"
            desc="Swipe away visual clutter."
            icon={Activity}
            route="/clear"
            color="#a78bfa"
          />
          <InterventionCard
            title="Rhythm Tap"
            desc="Grounding for panic attacks."
            icon={Fingerprint}
            route="/rhythm"
            color="#f87171"
          />

          {/* SOS Card */}
          <Link href="/emergency" style={{ textDecoration: 'none' }}>
            <div className="bg-[#ff4d4d15] rounded-[24px] p-5 flex flex-row items-center cursor-pointer border border-[#ff4d4d40] shadow-[0_4px_20px_rgba(255,77,77,0.15)] mt-2">
              <div className="w-[50px] h-[50px] rounded-[16px] bg-[#ff4d4d30] flex justify-center items-center mr-4">
                <BriefcaseMedical color="#ff4d4d" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-white text-[17px] font-bold mb-1">SOS Protocol</h4>
                <p className="text-[#94a3b8] text-[13px] m-0">Tap for immediate help</p>
              </div>
              <div className="w-[32px] h-[32px] rounded-full bg-[#ff4d4d30] flex justify-center items-center">
                <ShieldAlert color="#ff4d4d" size={16} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function ModeItem({ label, icon: Icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) {
  const color = active ? "#13ecec" : "#64748b";
  return (
    <button onClick={onClick} className="mode-btn group relative">
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-[#334155] rounded-full -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Icon size={20} color={color} />
      <span className="mode-btn-text" style={{ color }}>{label}</span>
    </button>
  );
}

function InterventionCard({ title, desc, icon: Icon, route, color }: { title: string, desc: string, icon: any, route: string, color: string }) {
  return (
    <Link href={route} style={{ textDecoration: 'none' }}>
      <div className="bg-[#1e293b] rounded-[24px] p-5 flex flex-row items-center border border-white/5 cursor-pointer shadow-md hover:bg-[#334155] transition-colors">
        <div className="w-[50px] h-[50px] rounded-[16px] bg-[#0f172a] flex justify-center items-center mr-4 shadow-inner border border-white/5">
          <Icon color={color} size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-white text-[17px] font-bold mb-1">{title}</h4>
          <p className="text-[#94a3b8] text-[13px] m-0">{desc}</p>
        </div>
        <ChevronRight color="#475569" size={20} />
      </div>
    </Link>
  );
}
