import React from 'react';
import Card from '../Card';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  actions?: React.ReactNode;
  severity?: 'default' | 'info' | 'warning' | 'danger';
  disabled?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true,
  actions,
  severity = 'default',
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const severityClasses = {
    default: 'border-gray-200 dark:border-gray-700',
    info: 'border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    warning: 'border-yellow-100 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
  };

  const headerClasses = {
    default: 'border-gray-200 dark:border-gray-700',
    info: 'border-blue-100 dark:border-blue-800',
    warning: 'border-yellow-100 dark:border-yellow-800',
    danger: 'border-red-100 dark:border-red-800',
  };

  return (
    <Card 
      className={`
        ${severityClasses[severity]}
        ${disabled ? 'opacity-60 pointer-events-none' : ''}
        ${className}
      `}
    >
      <div
        className={`
          flex items-start justify-between border-b pb-4 mb-4
          ${headerClasses[severity]}
          ${collapsible ? 'cursor-pointer select-none' : ''}
        `}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div>
          <div className="flex items-center">
            {collapsible && (
              <svg
                className={`h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 transform transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="ml-4 flex-shrink-0">{actions}</div>
        )}
      </div>

      <div
        className={`
          transition-all duration-200 ease-in-out
          ${!isExpanded ? 'hidden' : ''}
          ${disabled ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        {children}
      </div>
    </Card>
  );
};

// Example usage:
// <FormSection
//   title="Basic Information"
//   description="Please fill in your personal details."
//   collapsible
//   defaultExpanded
//   severity="info"
//   actions={
//     <Button size="sm" variant="secondary">
//       Edit
//     </Button>
//   }
// >
//   <div className="space-y-4">
//     <FormGroup label="Name">
//       <FormInput />
//     </FormGroup>
//     <FormGroup label="Email">
//       <FormInput type="email" />
//     </FormGroup>
//   </div>
// </FormSection>

export default FormSection;