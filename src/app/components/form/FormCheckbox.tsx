import React, { forwardRef, useCallback, useImperativeHandle } from 'react';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement, []);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (props.onChange) {
          props.onChange(event);
        }
      },
      [props.onChange]
    );

    const handleRef = useCallback(
      (element: HTMLInputElement | null) => {
        internalRef.current = element;

        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref]
    );

    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            ref={handleRef}
            onChange={handleChange}
            className={`form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary ${className}`}
            {...props}
          />
          {label && <span className="text-sm">{label}</span>}
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;