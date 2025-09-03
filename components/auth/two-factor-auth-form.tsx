
'use client';

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"


export function TwoFactorAuthForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            if (otp === '123456') { // Mock OTP check
                toast({
                    title: "Inicio de Sesión Exitoso",
                    description: "Bienvenido de nuevo.",
                });
                router.push('/dashboard');
            } else {
                toast({
                    title: "Error de Verificación",
                    description: "El código ingresado es incorrecto. Por favor, intente de nuevo.",
                    variant: "destructive",
                });
                setOtp('');
            }
        }, 1000);
    }

    return (
            <Card className="mx-auto max-w-sm z-10">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center">Verificación de Dos Pasos</CardTitle>
                    <CardDescription className="text-center">
                        Hemos enviado un código de 6 dígitos a su teléfono. Ingréselo para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="grid gap-4">
                        <div className="grid gap-2 text-center">
                            <Label htmlFor="otp-input" className="sr-only">Código de Verificación</Label>
                            <InputOTP
                                id="otp-input"
                                maxLength={6}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                                containerClassName="justify-center"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verificar
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <Button variant="link" className="text-muted-foreground">
                            ¿No recibió un código? Reenviar
                        </Button>
                    </div>
                </CardContent>
            </Card>
    )
}
