

'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { InteractiveGuide } from './interactive-guide';
import { SupportDialog } from './support-dialog';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const FonoClippy = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 120" 
      className="w-28 h-36 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
    >
        <g className="group">
            {/* Body */}
            <path d="M 20 110 C 10 90, 10 60, 25 40 S 40 15, 50 20 S 60 25, 75 40 S 90 90, 80 110 Z" fill="hsl(var(--primary))" stroke="hsl(var(--sidebar-foreground))" strokeWidth="2.5" />
            <path d="M 22 108 C 12 88, 12 58, 27 38 S 42 13, 50 18 S 58 23, 73 38 S 88 88, 78 108 Z" fill="hsl(var(--background))" />
            
            {/* Eyes */}
            <circle cx="40" cy="50" r="8" fill="#fff" stroke="#333" strokeWidth="1.5" />
            <circle cx="60" cy="50" r="8" fill="#fff" stroke="#333" strokeWidth="1.5" />
            <circle cx="38" cy="50" r="3" fill="#333" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <circle cx="58" cy="50" r="3" fill="#333" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            
            {/* Mouth */}
            <path d="M 45 65 Q 50 70, 55 65" stroke="#333" fill="none" strokeWidth="2" strokeLinecap='round' className="transition-transform duration-200 group-hover:scale-y-110" />

            {/* Brain waves */}
            <path d="M 50 35 Q 55 30, 60 35" stroke="hsl(var(--primary))" fill="none" strokeWidth="2.5" strokeLinecap='round'/>
            <path d="M 50 28 Q 58 20, 66 28" stroke="hsl(var(--primary))" fill="none" strokeWidth="2.5" strokeLinecap='round' opacity="0.7"/>
        </g>
    </svg>
);


export function HelpAssistant() {
    const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
    const [isGuideActive, setIsGuideActive] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser && typeof window !== 'undefined') {
            const isNewUser = !localStorage.getItem('tutorialCompleted');
            if (isNewUser) {
                setIsGuideActive(true);
            }
        }
      });
      return () => unsubscribe();
    }, []);
    
    const isPremiumPlan = user && ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(user.email!);

    const handleGuideClose = () => {
        setIsGuideActive(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('tutorialCompleted', 'true');
            // This might trigger the profile setup dialog on the dashboard page
        }
    }
    
  return (
    <>
      <div className="fixed bottom-0 right-0 z-50 group hidden md:block">
        <Button
          variant="ghost"
          className="h-auto p-0 rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => setIsSupportDialogOpen(true)}
          aria-label="Abrir Asistente de Ayuda"
        >
          <FonoClippy />
        </Button>
      </div>
      
      <SupportDialog 
        isOpen={isSupportDialogOpen} 
        onClose={() => setIsSupportDialogOpen(false)}
        onStartGuide={() => {
            setIsSupportDialogOpen(false);
            setIsGuideActive(true);
        }}
        isPremium={!!isPremiumPlan}
      />

      {isGuideActive && <InteractiveGuide onClose={handleGuideClose} />}
    </>
  );
}
