
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppFooter } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function NeuroNominaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
          <AppFooter />
        </div>
      </div>
    </SidebarProvider>
  )
}
