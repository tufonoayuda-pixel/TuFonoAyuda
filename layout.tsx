import type { Metadata } from 'next';
import { PT_Sans, Orbitron, Roboto, Lato, Open_Sans, Montserrat, Anton, Yanone_Kaffeesatz } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import Script from 'next/script';


export const metadata: Metadata = {
  title: 'TuFonoAyuda',
  description: 'Asistente IA para Fonoaudiólogos Chilenos',
};

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const orbitron = Orbitron({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-orbitron',
});

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-roboto',
});

const lato = Lato({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-lato',
});

const openSans = Open_Sans({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-open-sans',
});

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-montserrat',
});

const anton = Anton({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-anton',
});

const yanone = Yanone_Kaffeesatz({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-yanone',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-background font-body antialiased",
          ptSans.variable,
          orbitron.variable,
          roboto.variable,
          lato.variable,
          openSans.variable,
          montserrat.variable,
          anton.variable,
          yanone.variable
        )}>
        <ThemeProvider
            attribute="class"
            defaultTheme="theme-default"
            enableSystem
            disableTransitionOnChange
            themes={['theme-default', 'theme-ocean', 'theme-coral', 'theme-forest', 'theme-pokemon', 'theme-clinical', 'theme-mystic', 'theme-valkyrie', 'theme-prisma', 'theme-morphosis', 'theme-synthwave', 'theme-matrix']}
        >
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
