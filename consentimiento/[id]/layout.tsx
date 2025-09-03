
import { Brain } from "lucide-react";

export default function ConsentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-svh bg-secondary/50">
      <header className="p-4 bg-background border-b">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Brain className="h-8 w-8 text-primary" />
            <div className="flex items-baseline">
                <span className="font-bold text-xl">TuFonoAyuda</span>
            </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground border-t bg-background">
        © {new Date().getFullYear()} TuFonoAyuda. Todos los derechos reservados.
      </footer>
    </div>
  )
}
