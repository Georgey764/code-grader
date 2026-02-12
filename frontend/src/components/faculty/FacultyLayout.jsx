import { SideBar } from "@/components/global/sections";

export default function FacultyLayout({ Children }) {
  return (
    <>
      <SideBar />
      {Children}
    </>
  );
}
