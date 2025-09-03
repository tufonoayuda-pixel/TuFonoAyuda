
'use client';

import { AppFooter } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import PricingPage from "./page";

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 px-4">
          <PricingPage isStandalone={true} />
        </main>
        <AppFooter />
      </div>
    );
}
