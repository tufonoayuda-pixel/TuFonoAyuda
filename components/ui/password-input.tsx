
'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PasswordStrength {
    score: number;
    text: string;
    color: string;
}

const usePasswordStrength = (password: string): PasswordStrength => {
    return React.useMemo(() => {
        let score = 0;
        if (!password) return { score: 0, text: '', color: 'bg-transparent' };

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const scorePercentage = (score / 6) * 100;
        let text = 'Muy Débil';
        let color = 'bg-red-500';

        if (scorePercentage >= 100) {
            text = 'Muy Segura';
            color = 'bg-green-500';
        } else if (scorePercentage >= 80) {
            text = 'Segura';
            color = 'bg-emerald-500';
        } else if (scorePercentage >= 60) {
            text = 'Buena';
            color = 'bg-yellow-500';
        } else if (scorePercentage >= 40) {
            text = 'Débil';
            color = 'bg-orange-500';
        }

        return { score: scorePercentage, text, color };
    }, [password]);
};


interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const strength = usePasswordStrength(value as string);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
            ref={ref}
            value={value}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {isClient && value && (
            <div className="space-y-1">
                <Progress value={strength.score} className="h-1" indicatorClassName={strength.color} />
                <p className="text-xs text-muted-foreground">{strength.text}</p>
            </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
