"use client";
import useMetadata from "@/hooks";
import { useRouter } from "next/navigation";

export default function Page({ children }) {
  const router = useRouter();
  const { url } = useMetadata();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const cwid = localStorage.getItem("cwid");

    if (!cwid || !role) {
      router.push("/login");
    }
    const fetchRole = async () => {
      console.log(role);

      if (role == "FA") {
        router.push("/faculty");
      }
      if (role == "ST") {
        router.push("/student");
      }
    };
    fetchRole();
  }, [router, url]);
  return <>{children}</>;
}
