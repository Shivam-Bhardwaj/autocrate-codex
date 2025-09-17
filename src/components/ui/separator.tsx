import * as SeparatorPrimitive from '@radix-ui/react-separator'
import clsx from 'clsx'
import { ComponentPropsWithoutRef } from 'react'

export function Separator({ className, orientation = 'horizontal', ...props }: ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative
      orientation={orientation}
      className={clsx(
        'bg-slate-800',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
}
