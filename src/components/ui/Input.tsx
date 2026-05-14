'use client'

import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[14px] text-neutral-text font-medium leading-none mb-0.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-neutral-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input-base ${icon ? 'pl-11' : ''} ${error ? 'border-status-error focus:ring-status-error/10' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-[12px] text-status-error leading-snug">{error}</span>
        )}
        {helpText && !error && (
          <span className="text-[12px] text-neutral-muted leading-snug">{helpText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
