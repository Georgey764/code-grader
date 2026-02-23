import Link from "next/link";
import { HeadingWrapper } from "@/components/ui/sections";

export default function Page() {
  return (
    <HeadingWrapper name="Settings">
      <Link href={`/logout`}>
        <button className="text-white px-4 py-2 bg-primary rounded cursor-pointer">
          Logout
        </button>
      </Link>
    </HeadingWrapper>
  );
}
