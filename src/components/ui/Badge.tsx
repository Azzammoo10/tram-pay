type BadgeVariant = 'primary' | 'success' | 'warning' | 'error'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

export default function Badge({ variant, children }: BadgeProps) {
  const cls: Record<BadgeVariant, string> = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  }
  return <span className={cls[variant]}>{children}</span>
}
