import { Sidebar, BackButton } from "@/components/ui/elements";
import { HeadingWrapper } from "@/components/ui/sections";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out ml-0 md:ml-20 lg:ml-64">
        <main className="p-4 md:p-8 lg:p-12">
          <div className="mt-4 md:mt-0">
            <BackButton />
            <HeadingWrapper>{children}</HeadingWrapper>
          </div>
        </main>
      </div>
    </div>
  );
}
