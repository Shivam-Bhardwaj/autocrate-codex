import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 disabled:cursor-not-allowed disabled:opacity-50'

    const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary: 'bg-primary-500 text-white hover:bg-primary-400 shadow-elevation',
      outline: 'border border-slate-700 text-slate-100 hover:border-primary-400 hover:text-primary-200',
      ghost: 'text-slate-300 hover:text-primary-200 hover:bg-slate-900/70'
    }

    return <button ref={ref} className={cn(baseStyles, variantStyles[variant], className)} {...props} />
  }
)

Button.displayName = 'Button'
