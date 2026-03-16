"use client";
import React, { useState, useMemo } from "react";
import { BookOpen, Settings, Menu, X, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMetadata } from "@/context";

const navConfig = {
  student: [
    {
      icon: <BookOpen size={20} />,
      label: "Courses",
      route: "/app/student",
    },
  ],
  faculty: [
    { icon: <BookOpen size={20} />, label: "Courses", route: "/app/faculty" },
  ],
  ga: [
    {
      icon: <BookOpen size={20} />,
      label: "Courses",
      route: "/app/student",
    },
  ],
};

export default function Sidebar() {
  const { name, logout } = useMetadata(); // Pull logout from context
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = useMemo(() => {
    const role = pathname.split("/")[2]?.toLowerCase();
    return [
      ...(navConfig[role] || []),
      {
        icon: <Settings size={20} />,
        label: "Settings",
        route: `/app/${role}/settings`,
      },
    ];
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 z-50 bg-primary w-full h-16 flex items-center justify-between px-4 shadow-md">
        <span className="text-white font-mono text-xl tracking-tighter uppercase font-black">
          {name ? name[0] : "W"}
        </span>
        <button onClick={() => setIsOpen(true)} className="p-2 text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Rail */}
      <aside
        className={`
        fixed top-0 left-0 h-screen bg-primary text-white z-[70] transition-all duration-300
        w-64 md:w-16 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full py-6 items-center">
          <div className="mb-10 flex items-center justify-center">
            <span className="font-black text-2xl tracking-tighter text-secondary hidden md:block">
              {name ? name[0] : "W"}
            </span>
            <div className="md:hidden flex items-center justify-between w-48">
              <span className="font-black text-xl uppercase tracking-widest">
                {name}
              </span>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-4 w-full px-2">
            {navItems.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  router.push(item.route);
                  setIsOpen(false);
                }}
                className="relative flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 hover:text-secondary transition-all group"
              >
                <div className="mx-auto">{item.icon}</div>
                <span className="font-bold text-xs md:hidden uppercase tracking-widest">
                  {item.label}
                </span>
                <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-accent text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap z-50">
                  {item.label}
                </div>
              </button>
            ))}
          </nav>

          {/* Logout Action Button */}
          <button
            onClick={handleLogout}
            className="mt-auto p-3 text-white/40 hover:text-white transition-colors relative group"
            title="Logout"
          >
            <LogOut size={20} />
            <div className="hidden md:group-hover:block absolute left-full ml-4 px-2 py-1 bg-error text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap z-50">
              Sign Out
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
