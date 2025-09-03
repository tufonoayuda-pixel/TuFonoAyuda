
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Loader2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            toast({
                title: "Consentimiento Requerido",
                description: "Debe aceptar los términos y condiciones para crear una cuenta.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                sendEmailVerification(user)
                    .then(() => {
                        toast({
                            title: "Revisa tu correo",
                            description: `Hemos enviado un correo de verificación a ${email}.`
                        });
                        router.push(`/registro/verificar?email=${encodeURIComponent(email)}`);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                let errorMessage = error.message;

                if (errorCode === 'auth/weak-password') {
                    errorMessage = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
                } else if (errorCode === 'auth/email-already-in-use') {
                    errorMessage = 'Este correo electrónico ya está en uso.';
                }

                toast({
                    title: "Error de Registro",
                    description: errorMessage,
                    variant: "destructive"
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const handleGoogleRegister = async () => {
        if (!agreed) {
            toast({
                title: "Consentimiento Requerido",
                description: "Debe aceptar los términos y condiciones para registrarse.",
                variant: "destructive"
            });
            return;
        }
        setIsGoogleLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/dashboard');
        } catch (error) {
            toast({
                title: "Error de Registro con Google",
                description: "No se pudo completar el registro. Por favor, intente de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 animate-gradient-bg bg-[length:200%_200%] auth-container">
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
            <CardTitle className="text-2xl text-center pt-4">Crea tu Cuenta</CardTitle>
            <CardDescription className="text-center">
             Comienza con una prueba gratuita de 7 días.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="full-name">Nombre Completo</Label>
                    <Input id="full-name" placeholder="Ej: Dr. Cristóbal" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                 <div className="grid gap-2">
                        <Label htmlFor="gender">Género</Label>
                        <Select required>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Seleccionar género" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Masculino</SelectItem>
                                <SelectItem value="female">Femenino</SelectItem>
                                <SelectItem value="other">Prefiero no decirlo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                    <Input id="phone" type="tel" placeholder="+56912345678" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <PasswordInput id="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                    <Label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Acepto los{" "}
                        <Link
                        href="/terminos"
                        className="underline underline-offset-4 hover:text-primary"
                        target="_blank"
                        >
                        términos y condiciones
                        </Link>
                        .
                    </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Comenzar Prueba Gratuita"}
                </Button>
                </div>
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
                <Button variant="outline" type="button" onClick={handleGoogleRegister} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <GoogleIcon className="mr-2" />
                    Registrarse con Google
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
            ¿Ya tiene una cuenta?{" "}
            <Link href="/login" className="underline">
                Iniciar Sesión
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}
