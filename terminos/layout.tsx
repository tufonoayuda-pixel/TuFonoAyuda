
import { Brain } from "lucide-react";
import Link from "next/link";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <div className="flex items-baseline">
                <span className="font-bold text-xl">TuFonoAyuda</span>
            </div>
        </Link>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
            {children}
        </div>
        </main>
      <footer className="text-center p-4 text-xs text-muted-foreground border-t">
        © {new Date().getFullYear()} TuFonoAyuda. Todos los derechos reservados.
      </footer>
    </div>
  )
}
