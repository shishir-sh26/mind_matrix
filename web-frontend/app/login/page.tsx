"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F9FF] via-white to-[#FDF2F8]">
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-sky-100/50 rounded-[2.5rem] p-10 w-full max-w-md border border-white">
        <div className="text-center mb-10">
          <div className="bg-sky-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-100">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase">Mind Matrix</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Secure Admin Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-sky-400" size={18} />
            <input
              type="email"
              placeholder="Admin Email"
              className="w-full bg-white/50 border border-slate-100 focus:border-sky-300 rounded-2xl py-3.5 pl-12 outline-none transition-all shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-pink-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/50 border border-slate-100 focus:border-pink-300 rounded-2xl py-3.5 pl-12 outline-none transition-all shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-sky-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Authorize Session"}
          </button>
        </form>
      </div>
    </div>
  );
}