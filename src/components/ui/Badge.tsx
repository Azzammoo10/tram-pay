type BadgeVariant = 'primary' | 'success' | 'warning' | 'error'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  const cls: Record<BadgeVariant, string> = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  }
  return <span className={`${cls[variant]} ${className}`}>{children}</span>
}
