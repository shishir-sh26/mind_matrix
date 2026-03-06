"use client";

import { useState } from "react";
import { X, Info, CheckCircle2 } from "lucide-react";
import { motion, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";

const INITIAL_SHAPES = [
  { id: 1, x: 50, y: 150, size: 80, rounded: "rounded-[16px]" },
  { id: 2, x: 200, y: 200, size: 60, rounded: "rounded-[16px]" },
  { id: 3, x: 120, y: 350, size: 70, rounded: "rounded-full" },
  { id: 4, x: 80, y: 480, size: 90, rounded: "rounded-[16px]" },
  { id: 5, x: 220, y: 400, size: 75, rounded: "rounded-[16px]" },
];

export default function ClearSpace() {
  const router = useRouter();
  const [shapes, setShapes] = useState(INITIAL_SHAPES);
  
  const totalShapes = INITIAL_SHAPES.length;
  const clearedCount = totalShapes - shapes.length;
  const progress = (clearedCount / totalShapes) * 100;

  const handleDragEnd = (event: any, info: any, id: number) => {
    const threshold = 150;
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
        setShapes((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#091212] font-sans text-white overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center pt-12 px-5 relative z-20">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-[#1e293b] flex justify-center items-center border-none cursor-pointer hover:bg-[#334155] transition-colors"
        >
          <X color="white" size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[#94a3b8] text-[10px] font-bold tracking-[1px] uppercase">
            CLEAR THE SPACE
          </span>
          <span className="text-[#13ecec] text-xs font-semibold mt-0.5">
            {Math.round(progress)}% Cleared
          </span>
        </div>
        <button className="w-10 h-10 flex justify-center items-center border-none bg-transparent cursor-pointer">
          <Info color="white" size={20} />
        </button>
      </div>

      <div className="flex justify-center mt-10 relative z-20 pointer-events-none">
        <span className="text-[#64748b] text-sm font-bold tracking-[2px]">
          SWIPE TO CLEAR
        </span>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            drag
            dragConstraints={{ top: -300, left: -200, right: 200, bottom: 300 }}
            dragElastic={1}
            onDragEnd={(e, info) => handleDragEnd(e, info, shape.id)}
            whileDrag={{ scale: 1.1, cursor: "grabbing" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className={`absolute bg-[#1e293b] border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.3)] cursor-grab ${shape.rounded}`}
            style={{
              width: shape.size,
              height: shape.size,
              top: shape.y,
              left: shape.x,
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="pb-10 flex flex-col items-center relative z-20">
        <p className="text-[#475569] text-sm mb-5">You are making room for clarity...</p>
        
        <button 
          onClick={() => router.back()}
          className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full border transition-colors cursor-pointer ${
            shapes.length === 0 
              ? "bg-[#142121] border-[#13ecec30]" 
              : "bg-[#1e293b] border-white/5 hover:bg-[#334155]"
          }`}
        >
          <CheckCircle2 color={shapes.length === 0 ? "#13ecec" : "#64748b"} size={20} />
          <span className={`text-[15px] font-bold ${shapes.length === 0 ? "text-white" : "text-[#64748b]"}`}>
            Finish Clearing
          </span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#111d1d]">
          <motion.div 
            className="h-full bg-[#3b386e]" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
