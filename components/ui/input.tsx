import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground',
        'dark:bg-white/5 border-white/10 h-9 w-full min-w-0 rounded-md border bg-white/5 px-3 py-1 text-base shadow-sm',
        'transition-all duration-300 outline-none',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        /* Glow on focus */
        'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
