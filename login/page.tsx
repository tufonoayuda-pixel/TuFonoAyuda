
'use client'

import { useState } from "react";
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { TwoFactorAuthForm } from "@/components/auth/two-factor-auth-form";
import { User } from "lucide-react";

function AuthFooter() {
    return (
        <footer className="absolute bottom-0 w-full text-center p-4 text-xs text-muted-foreground z-10">
             <div className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span>Desarrollado por Flgo. Cristóbal San Martín</span>
            </div>
        </footer>
    );
}

function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === 'theme-default' || theme === 'light' || theme === 'system') {
            setTheme('theme-matrix');
        } else {
            setTheme('theme-default');
        }
    };

    const isMatrix = theme === 'theme-matrix';

    return (
        <Button 
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-20"
            aria-label={`Cambiar a tema ${isMatrix ? 'claro' : 'oscuro'}`}
        >
            {isMatrix ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Monitor className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
    )
}


export default function LoginPageContainer() {
    const [authStep, setAuthStep] = useState<'login' | '2fa'>('login');

    const handleLoginSuccess = (use2fa: boolean) => {
        if (use2fa) {
            setAuthStep('2fa');
        } else {
            // In a real app, this would redirect to the dashboard.
            // For this component, we can just log a success message.
            console.log("Login successful without 2FA");
            // A router push would happen here in a full app context.
            // Example: router.push('/dashboard');
        }
    }
    
    return (
         <div className="flex items-center justify-center min-h-svh bg-gradient-to-r from-primary/30 to-blue-200/30 animate-gradient-bg bg-[length:200%_200%] auth-container">
            <ThemeSwitcher />
            {authStep === 'login' ? (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
            ) : (
                <TwoFactorAuthForm />
            )}
            <AuthFooter />
        </div>
    )
}
