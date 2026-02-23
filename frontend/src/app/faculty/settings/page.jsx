import Link from "next/link";

export default function Page() {
  return (
    <Link href={`/logout`}>
      <button className="text-white px-4 py-2 bg-primary rounded cursor-pointer">
        Logout
      </button>
    </Link>
  );
}
