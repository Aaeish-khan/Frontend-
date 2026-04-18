import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-muted-foreground/60 dark:bg-white/5 border-white/10',
        'flex min-h-16 w-full rounded-md border bg-white/5 px-3 py-2 text-base shadow-sm',
        'transition-all duration-300 outline-none',
        'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm field-sizing-content',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
