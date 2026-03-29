import { RoleGuard } from "@/auth";

export default function Layout({ children }) {
  return <RoleGuard allowedRoles={["ST", "FA", "GA"]}>{children}</RoleGuard>;
}
