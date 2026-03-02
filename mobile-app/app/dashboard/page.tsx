"use client";

import React from 'react';
import { Activity, Battery, Radio, Settings, Home, ActivitySquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', distress: 20 },
  { time: '04:00', distress: 15 },
  { time: '08:00', distress: 45 },
  { time: '12:00', distress: 30 },
  { time: '16:00', distress: 60 },
  { time: '20:00', distress: 25 },
  { time: '24:00', distress: 20 },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-white font-sans text-[#455A64]">
      <aside className="w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-8">
        <div className="text-2xl font-bold tracking-tight text-[#455A64]">HackMatrix</div>
        <nav className="flex flex-col gap-5">
          <a href="#" className="flex items-center gap-3 text-[#A5D6A7] font-semibold"><Home size={20} /> Home</a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-[#455A64] transition-colors"><ActivitySquare size={20} /> Sensor Logs</a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-[#455A64] transition-colors"><Settings size={20} /> Settings</a>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#455A64]">Live Analytics</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest mb-3">Current State</span>
            <span className="text-3xl font-bold text-[#A5D6A7]">Calm</span>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest mb-3">Active Sensors</span>
            <div className="flex gap-6">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600"><Activity size={18} /> Accel</span>
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600"><Radio size={18} /> Haptics</span>
            </div>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-widest mb-3">Recent Interventions</span>
            <span className="text-lg font-medium text-[#455A64]">Breathing Guide</span>
          </div>
        </section>

        <section className="h-96 mb-10 p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Distress Levels (24h)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDistress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A5D6A7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#A5D6A7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip 
                cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="distress" stroke="#A5D6A7" strokeWidth={3} fillOpacity={1} fill="url(#colorDistress)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="mb-10 p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Device Management</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="pb-4 font-medium">Device ID</th>
                <th className="pb-4 font-medium">Battery</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-100/50 transition-colors">
                <td className="py-5 font-medium text-slate-700">TK-8921</td>
                <td className="py-5 flex items-center gap-2 text-slate-600"><Battery size={18} className="text-[#A5D6A7]" /> 87%</td>
                <td className="py-5 text-[#A5D6A7] font-medium">Online</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="p-10 rounded-[2rem] border-2 border-dashed border-[#A5D6A7] bg-[#F1F8F1] flex items-center justify-center cursor-pointer hover:bg-[#E8F4E8] transition-colors">
          <span className="text-[#455A64] font-medium tracking-wide">Drop New Logic Modules Here</span>
        </section>
      </main>
    </div>
  );
}