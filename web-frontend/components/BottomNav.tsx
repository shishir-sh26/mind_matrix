"use client";

import { Home, Dumbbell, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: Home, route: "/" },
    { label: "Exercises", icon: Dumbbell, route: "/exercises" },
    { label: "History", icon: Clock, route: "/history" },
    { label: "Emergency", icon: ShieldAlert, route: "/emergency", isAlert: true },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[80px] bg-[#091212] border-t border-white/5 flex justify-around items-center px-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.route;
        
        let color = "#64748b"; // default inactive Mutated text
        if (isActive) {
          color = item.isAlert ? "#f87171" : "#13ecec";
        }
        
        return (
          <Link
            key={item.label}
            href={item.route}
            className="flex flex-col items-center justify-center p-2 min-w-[64px]"
            style={{ textDecoration: 'none' }}
          >
            <Icon size={24} color={color} className="mb-[6px]" />
            <span
              className="text-[10px] font-semibold tracking-[0.5px]"
              style={{ color }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
