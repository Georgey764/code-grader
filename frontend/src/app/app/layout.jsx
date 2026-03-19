import { Sidebar, BackButton } from "@/components/ui/elements";
import { HeadingWrapper } from "@/components/ui/sections";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* Margin left fixed to 64px (w-16) on desktop */}
      <main className="flex-1 transition-all ml-0 md:ml-16 p-4 md:p-10">
        <div className="mt-16 md:mt-0 max-w-7xl mx-auto">
          <HeadingWrapper>{children}</HeadingWrapper>
        </div>
      </main>
    </div>
  );
}
