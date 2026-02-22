import { RoleGuard } from "@/auth";
import { Sidebar } from "@/components/student";

export default function Layout({ children }) {
  return (
    <RoleGuard allowedRoles={["ST"]}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
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
