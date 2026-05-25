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
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[15px] text-neutral-text font-normal leading-[1.0] tracking-[0px] mb-[8px]"
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
          <span className="text-[12px] font-normal leading-[1.4] text-status-error tracking-[0px] mt-[4px]">{error}</span>
        )}
        {helpText && !error && (
          <span className="text-[12px] font-normal leading-[1.4] text-neutral-muted tracking-[0px] mt-[4px]">{helpText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
