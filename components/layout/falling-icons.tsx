
'use client';

import { Brain, Mic, MessageSquare, Ear, Smile, ALargeSmall } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

const icons = [
    { Icon: Brain, className: 'left-[10%] animate-fall-1' },
    { Icon: Mic, className: 'left-[20%] animate-fall-2 [animation-delay:5s]' },
    { Icon: MessageSquare, className: 'left-[30%] animate-fall-3 [animation-delay:2s]' },
    { Icon: Ear, className: 'left-[40%] animate-fall-1 [animation-delay:7s]' },
    { Icon: Smile, className: 'left-[50%] animate-fall-2 [animation-delay:3s]' },
    { Icon: ALargeSmall, className: 'left-[60%] animate-fall-3 [animation-delay:9s]' },
    { Icon: Brain, className: 'left-[70%] animate-fall-1 [animation-delay:1s]' },
    { Icon: Mic, className: 'left-[80%] animate-fall-2 [animation-delay:6s]' },
    { Icon: MessageSquare, className: 'left-[90%] animate-fall-3 [animation-delay:4s]' },
];

export function FallingIcons() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {icons.map(({ Icon, className }, index) => (
                <div key={index} className={cn("absolute top-0", className)}>
                    <Icon className="text-primary/10" size={48} />
                </div>
            ))}
        </div>
    );
}
