import React from 'react';

interface FormGroupProps {
  children: React.ReactNode;
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  labelWidth?: string;
  noMargin?: boolean;
}

interface FormControlElement extends React.ReactElement {
  props: {
    id?: string;
    'aria-describedby'?: string;
    [key: string]: any;
  };
}

const FormGroup: React.FC<FormGroupProps> = ({
  children,
  label,
  helper,
  error,
  required,
  optional,
  className = '',
  layout = 'vertical',
  labelWidth = 'w-1/3',
  noMargin = false,
}) => {
  const isHorizontal = layout === 'horizontal';
  const groupId = React.useId();

  return (
    <div 
      className={`
        ${noMargin ? '' : 'mb-4'}
        ${isHorizontal ? 'sm:flex sm:items-start' : ''}
        ${className}
      `}
    >
      {label && (
        <label
          htmlFor={groupId}
          className={`
            block text-sm font-medium text-gray-700 dark:text-gray-300
            ${isHorizontal ? `${labelWidth} pt-2 sm:text-right sm:mr-4` : 'mb-1'}
          `}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
          {optional && (
            <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">
              (Optional)
            </span>
          )}
        </label>
      )}

      <div className={isHorizontal ? 'flex-1' : ''}>
        {/* Clone children and add the groupId */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const elementChild = child as FormControlElement;
            return React.cloneElement(elementChild, {
              id: elementChild.props.id || groupId,
              'aria-describedby': error
                ? `${groupId}-error`
                : helper
                ? `${groupId}-helper`
                : undefined,
              ...elementChild.props,
            });
          }
          return child;
        })}

        {/* Helper text or error message */}
        {(helper || error) && (
          <p
            id={error ? `${groupId}-error` : `${groupId}-helper`}
            className={`mt-2 text-sm ${
              error 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {error || helper}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormGroup;