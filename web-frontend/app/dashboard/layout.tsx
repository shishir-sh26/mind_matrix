"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.push("/login");
  }, [router]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-semibold text-teal-600 mb-8">
          Mind Matrix
        </h2>

        <nav className="space-y-4 text-gray-700">
          <Link href="/dashboard" className="block hover:text-teal-500">
            Dashboard
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-10 text-sm text-red-500 hover:text-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#F5F7FA]">{children}</main>
    </div>
  );
}