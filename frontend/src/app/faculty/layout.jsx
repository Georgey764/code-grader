import { RoleGuard } from "@/auth";

export default function Layout({ children }) {
  return <RoleGuard allowedRoles={["FA"]}>{children}</RoleGuard>;
}
