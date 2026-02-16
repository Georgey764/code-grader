import { Sidebar } from "@/components/global/sections";

export default function FacultyLayout({ children }) {
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
