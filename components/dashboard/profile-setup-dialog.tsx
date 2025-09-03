
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface ProfileSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSetupDialog({ isOpen, onClose }: ProfileSetupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('https://placehold.co/80x80.png');
  const { toast } = useToast();

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Perfil Guardado',
        description: '¡Tu perfil profesional ha sido configurado!',
      });
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Completa tu Perfil</DialogTitle>
          <DialogDescription>
            Antes de comenzar, por favor completa tu información profesional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center gap-4">
                        <Image
                          src={profilePicUrl}
                          alt="Foto de perfil"
                          width={64}
                          height={64}
                          className="rounded-full"
                          data-ai-hint='profile image'
                        />
                        <Input id="profile-picture" type="file" accept="image/png, image/jpeg" className="max-w-xs" onChange={handleProfilePicChange} />
                    </div>
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Nombre Completo</Label>
                  <Input id="full-name" placeholder="Ej: Dr. Cristóbal" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="health-registry">Registro Superintendencia de Salud</Label>
                  <Input id="health-registry" placeholder="Ej: 123456" required />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                    Omitir por ahora
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar y Continuar
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
