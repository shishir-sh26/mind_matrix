"use client";

import { ShieldAlert, Phone, MessageSquare, BriefcaseMedical } from "lucide-react";

export default function EmergencyProtocol() {
  return (
    <div className="flex flex-col min-h-screen bg-[#091212] font-sans text-white px-5 pt-12 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#ff4d4d20] rounded-full flex justify-center items-center">
          <BriefcaseMedical color="#ff4d4d" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white m-0 tracking-tight">SOS Protocol</h1>
          <p className="text-[#f87171] text-sm font-semibold tracking-wide m-0">
            Immediate Assistance
          </p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-[24px] p-6 mb-6 border border-white/5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d4d20] rounded-bl-full -z-0 opacity-50 blur-2xl" />
        <h2 className="text-white text-lg font-bold mb-2 relative z-10">You are not alone.</h2>
        <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 relative z-10 max-w-[90%]">
          If you are in immediate danger or experiencing a medical emergency, please call your local emergency services immediately.
        </p>

        <button className="w-full bg-[#ff4d4d] hover:bg-[#ef4444] transition-colors py-4 rounded-full flex justify-center items-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(255,77,77,0.3)] relative z-10 border-none">
          <ShieldAlert color="white" size={20} />
          <span className="text-white font-bold text-base">Call Emergency Services</span>
        </button>
      </div>

      <h3 className="text-[#64748b] text-xs font-bold tracking-[2px] mb-4 mt-2">
        CRISIS RESOURCES
      </h3>

      <div className="flex flex-col gap-3">
        <ResourceCard 
          icon={Phone} 
          title="National Crisis Hotline" 
          desc="24/7 free and confidential support." 
        />
        <ResourceCard 
          icon={MessageSquare} 
          title="Text Support Line" 
          desc="Text HOME to connect with a counselor." 
        />
      </div>
    </div>
  );
}

function ResourceCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-[#1e293b] rounded-[24px] p-5 flex items-center gap-4 border border-white/5 cursor-pointer hover:bg-[#334155] transition-colors">
      <div className="w-12 h-12 rounded-[16px] bg-[#0f172a] shadow-inner border border-white/5 flex justify-center items-center shrink-0">
        <Icon color="#13ecec" size={20} />
      </div>
      <div className="flex-1">
        <h4 className="text-white text-base font-bold m-0 mb-1">{title}</h4>
        <p className="text-[#94a3b8] text-[13px] m-0 leading-tight">{desc}</p>
      </div>
    </div>
  );
}
