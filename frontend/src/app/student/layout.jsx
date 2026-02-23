import { RoleGuard } from "@/auth";
import { Sidebar } from "@/components/ui/elements";
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Menu, // Added for the mobile toggle
} from "lucide-react";

const navItems = [
  {
    icon: <BookOpen size={22} />,
    label: "Courses",
    route: "/student/courses",
  },
  {
    icon: <Settings size={22} />,
    label: "Settings",
    route: "/student/settings",
  },
];

export default function Layout({ children }) {
  return (
    <RoleGuard allowedRoles={["ST"]}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar navItems={navItems} />

        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out ml-0 md:ml-20 lg:ml-64">
          {/* --- MAIN CONTENT --- */}
          <main className="p-4 md:p-8 lg:p-12">
            <div className="mt-4 md:mt-0">{children}</div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
