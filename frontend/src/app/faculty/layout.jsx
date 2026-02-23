import { RoleGuard } from "@/auth";
import { Sidebar } from "@/components/ui/elements";
import {
  BookOpen,
  CheckSquare,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";

const navItems = [
  // {
  //   icon: <LayoutDashboard size={22} />,
  //   label: "Dashboard",
  //   route: "/student/",
  // },
  {
    icon: <BookOpen size={22} />,
    label: "Courses",
    route: "/faculty",
  },
  // {
  //   icon: <CheckSquare size={22} />,
  //   label: "To-Do",
  //   route: "/student/to-do",
  // },
  // { icon: <User size={22} />, label: "Profile", route: "/404" },
  {
    icon: <Settings size={22} />,
    label: "Settings",
    route: "/faculty/settings",
  },
];

export default function Layout({ children }) {
  return (
    <RoleGuard allowedRoles={["FA"]}>
      <div className="flex min-h-screen bg-background">
        <Sidebar navItems={navItems} />
        <div
          className={`
        flex-1 transition-all duration-300 ease-in-out
        ml-0 
        md:ml-20 
        lg:ml-64
        p-4 md:p-8 lg:p-12
      `}
        >
          <div className="mt-14 md:mt-0">{children}</div>
        </div>
      </div>
    </RoleGuard>
  );
}
