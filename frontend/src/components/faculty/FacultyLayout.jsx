import { Sidebar } from "@/components/global/sections";

export default function FacultyLayout({ Children }) {
  return (
    <>
      <Sidebar />
      {Children}
    </>
  );
}
