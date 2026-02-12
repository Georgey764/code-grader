"use client";

import { Header, Footer, Hero } from "@/components/HomePage/sections";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/global/sections";

export default function HomePage() {
  const { user, isLoading, name } = useMetadata();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header name={name} user={user} />
      <Hero user={user} />
      <Footer />
    </div>
  );
}
