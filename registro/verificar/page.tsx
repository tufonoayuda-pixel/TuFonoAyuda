
'use client'

import { Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');

    return (
        <Card className="mx-auto max-w-sm z-10">
            <CardHeader>
            <CardTitle className="text-2xl">Verificación de Correo</CardTitle>
            <CardDescription>
                Hemos enviado un correo de verificación a <strong>{email}</strong>. Por favor, haga clic en el enlace del correo para activar su cuenta.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className='text-sm text-muted-foreground'>
                    Una vez verificado, podrá iniciar sesión. Si no ve el correo, revise su carpeta de spam.
                </p>
            <Button onClick={() => router.push('/login')} className="w-full">
                Volver a Inicio de Sesión
            </Button>
            <Button variant="link" size="sm" className="w-full" disabled>
                    Reenviar correo (próximamente)
                </Button>
            </CardContent>
        </Card>
    );
}


export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 animate-gradient-bg bg-[length:200%_200%] auth-container">
      <Suspense fallback={
        <div className='flex flex-col items-center gap-4 text-center text-foreground'>
            <Loader2 className='h-8 w-8 animate-spin'/>
            <p>Cargando...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
