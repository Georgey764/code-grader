import { StudentLayout } from "@/components/student";
import { RoleGuard } from "@/auth";

export default function Layout({ Children }) {
  return (
    <RoleGuard allowedRoles={["ST"]}>
      <StudentLayout>{Children}</StudentLayout>
    </RoleGuard>
  );
}
