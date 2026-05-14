'use client'

import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[14px] text-neutral-text leading-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-base ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
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
