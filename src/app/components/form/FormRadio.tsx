import React from 'react';

interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  helper?: string;
}

interface FormRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helper?: string;
  options: RadioOption[];
  orientation?: 'vertical' | 'horizontal';
}

const FormRadio = React.forwardRef<HTMLInputElement, FormRadioProps>(
  ({ 
    label, 
    error, 
    helper, 
    options, 
    orientation = 'vertical', 
    className = '', 
    id,
    name,
    ...props 
  }, ref) => {
    const groupId = id || `radio-group-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            id={`${groupId}-label`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        <div
          role="radiogroup"
          aria-labelledby={`${groupId}-label`}
          className={`
            ${orientation === 'vertical' ? 'space-y-4' : 'flex flex-wrap gap-6'}
          `}
        >
          {options.map((option, index) => {
            const optionId = `${groupId}-${index}`;
            
            return (
              <div key={optionId} className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    ref={index === 0 ? ref : undefined}
                    type="radio"
                    id={optionId}
                    name={name}
                    value={option.value}
                    disabled={option.disabled}
                    className={`
                      h-4 w-4
                      ${error
                        ? 'border-red-300 text-red-600 focus:ring-red-500'
                        : 'border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
                      }
                      disabled:cursor-not-allowed disabled:opacity-70
                      ${className}
                    `}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={
                      error 
                        ? `${groupId}-error` 
                        : option.helper 
                          ? `${optionId}-helper` 
                          : helper 
                            ? `${groupId}-helper` 
                            : undefined
                    }
                    {...props}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor={optionId}
                    className={`
                      font-medium
                      ${error
                        ? 'text-red-900 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300'
                      }
                      ${option.disabled ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    {option.label}
                  </label>
                  {option.helper && (
                    <p
                      id={`${optionId}-helper`}
                      className="mt-1 text-gray-500 dark:text-gray-400"
                    >
                      {option.helper}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {(error || helper) && (
          <p
            id={error ? `${groupId}-error` : `${groupId}-helper`}
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

FormRadio.displayName = 'FormRadio';

// Example usage:
// const options = [
//   { 
//     label: 'Option 1', 
//     value: '1',
//     helper: 'Additional information about option 1'
//   },
//   { 
//     label: 'Option 2', 
//     value: '2' 
//   },
//   { 
//     label: 'Option 3', 
//     value: '3',
//     disabled: true
//   },
// ];
//
// <FormRadio
//   name="example"
//   label="Select an option"
//   options={options}
//   orientation="vertical"
//   onChange={(e) => console.log(e.target.value)}
// />

export default FormRadio;