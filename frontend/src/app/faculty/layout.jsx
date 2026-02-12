import { FacultyLayout } from "@/components/faculty";
import { RoleGuard } from "@/auth";

export default function Layout({ Children }) {
  return (
    <RoleGuard allowedRoles={["FA"]}>
      <FacultyLayout>{Children}</FacultyLayout>
    </RoleGuard>
  );
}
