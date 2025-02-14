import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  rows?: number;
  autoResize?: boolean;
  maxHeight?: number;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ 
    label, 
    error, 
    helper, 
    className = '', 
    id, 
    rows = 4, 
    autoResize = false,
    maxHeight,
    onChange,
    ...props 
  }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = React.useMemo(() => {
      if (ref) {
        return typeof ref === 'function'
          ? (node: HTMLTextAreaElement) => {
              textareaRef.current = node;
              ref(node);
            }
          : (textareaRef.current = ref.current);
      }
      return textareaRef;
    }, [ref]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(
          textareaRef.current.scrollHeight,
          maxHeight || Infinity
        );
        textareaRef.current.style.height = `${newHeight}px`;
      }
      onChange?.(e);
    }, [autoResize, maxHeight, onChange]);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <div>
          <textarea
            ref={combinedRef as React.RefObject<HTMLTextAreaElement>}
            id={inputId}
            rows={rows}
            onChange={handleChange}
            className={`
              block w-full rounded-md shadow-sm 
              ${error
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              }
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              resize-none
              transition-all duration-200 ease-in-out
              sm:text-sm
              ${className}
            `}
            style={{
              maxHeight: maxHeight ? `${maxHeight}px` : undefined,
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined
            }
            {...props}
          />
        </div>
        {(error || helper) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            className={`mt-2 text-sm ${
              error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;