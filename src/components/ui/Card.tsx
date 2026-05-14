interface CardProps {
  accent?: boolean
  children: React.ReactNode
  className?: string
}

export default function Card({ accent = false, children, className = '' }: CardProps) {
  return (
    <div className={`${accent ? 'card-accent' : 'card-base'} ${className}`}>
      {children}
    </div>
  )
}
