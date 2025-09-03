
'use client';

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithPopup, UserCredential, signInWithEmailAndPassword, AuthError, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { PasswordInput } from '@/components/ui/password-input';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#fbc02d"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#e53935"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4caf50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.657-3.356-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z"
      />
      <path
        fill="#1565c0"
        d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	l6.19,5.238C39.901,35.636,44,30.49,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

interface LoginFormProps {
    onLoginSuccess: (use2fa: boolean) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            // The onAuthStateChanged listener will handle redirection.
            router.push('/dashboard');
        } catch (error) {
            const authError = error as AuthError;
            
            if (authError.code === 'auth/popup-closed-by-user') {
                console.log("Google Sign-In popup closed by user.");
                // This is a normal flow, no need to show an error toast.
            } else if (authError.code === 'auth/unauthorized-domain') {
                 toast({
                    title: "Error de Dominio",
                    description: "Este dominio no está autorizado para iniciar sesión. Por favor, contacte al administrador.",
                    variant: "destructive",
                });
            } else {
                 console.error("Google Sign-In Error:", authError.code, authError.message);
                 toast({
                    title: "Error de Inicio de Sesión",
                    description: "No se pudo iniciar sesión con Google. Por favor, intente de nuevo.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleLogin = (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);
        
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                const use2fa = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('2fa_enabled') || 'false') : false;
                onLoginSuccess(use2fa);
            })
            .catch(() => {
                 toast({
                    title: "Error de Inicio de Sesión",
                    description: "El correo o la contraseña son incorrectos.",
                    variant: "destructive",
                });
            })
            .finally(() => {
                setIsLoading(false);
            })
    };

  return (
        <Card className="mx-auto max-w-sm z-10">
        <CardHeader>
            <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-2 py-1">
                <Brain className="h-10 w-10 text-foreground" />
                <div className="flex items-baseline">
                    <span className="font-bold text-2xl text-foreground">TuFonoAyuda</span>
                </div>
            </div>
            </div>
            <p className="text-center text-muted-foreground text-sm px-4">"El Futuro de la Fonoaudiología ha llegado, y puede estar en tus manos".</p>
            <CardTitle className="text-2xl text-center pt-4">Inicio de Sesión</CardTitle>
            <CardDescription className="text-center">
            Ingrese su correo para acceder a su cuenta
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                  id="email"
                  type="email"
                  placeholder="correo@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
              <div className="grid gap-2">
                  <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline">
                      ¿Olvidó su contraseña?
                  </Link>
                  </div>
                  <PasswordInput id="password" required placeholder="Ej: P@ssw0rd123" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar Sesión
              </Button>
            </form>
            <div className='relative my-4'>
              <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t'/>
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>O continúe con</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <GoogleIcon className="mr-2" />
                    Google
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
            ¿No tiene una cuenta?{" "}
            <Link href="/registro" className="underline">
                Regístrese
            </Link>
            </div>
        </CardContent>
        </Card>
  )
}
