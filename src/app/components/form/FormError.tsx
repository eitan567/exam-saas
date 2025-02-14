import React from 'react';
import { FieldError, FormErrors, FormErrorHandler } from '@/app/utils/formErrors';

interface FormErrorMessageProps {
  error: FieldError;
  className?: string;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  error,
  className = '',
}) => {
  if (!error) return null;

  return (
    <p
      role="alert"
      className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}
    >
      {error}
    </p>
  );
};

interface FormErrorSummaryProps {
  errors: FormErrors;
  className?: string;
  onErrorClick?: (field: string) => void;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  className = '',
  onErrorClick,
}) => {
  if (!FormErrorHandler.hasErrors(errors)) return null;

  const allErrors = FormErrorHandler.getAllErrors(errors);

  return (
    <div
      role="alert"
      className={`rounded-md bg-red-50 dark:bg-red-900/20 p-4 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            There {allErrors.length === 1 ? 'is' : 'are'} {allErrors.length} error
            {allErrors.length === 1 ? '' : 's'} with your submission
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <ul role="list" className="list-disc space-y-1 pl-5">
              {allErrors.map((error, index) => (
                <li key={index}>
                  {onErrorClick ? (
                    <button
                      type="button"
                      className="hover:underline focus:outline-none focus:underline"
                      onClick={() => onErrorClick(error.split(':')[0])}
                    >
                      {error}
                    </button>
                  ) : (
                    error
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FormFieldErrorProps {
  errors: FormErrors;
  name: string;
  touched?: Record<string, boolean>;
  showUntouched?: boolean;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({
  errors,
  name,
  touched,
  showUntouched = false,
  className = '',
}) => {
  const error = FormErrorHandler.getFieldError(errors, name);
  const isTouched = touched ? FormErrorHandler.isFieldTouched(touched, name) : true;

  if (!error || (!showUntouched && !isTouched)) return null;

  return <FormErrorMessage error={error} className={className} />;
};

// Example usage:
// export const ExampleForm: React.FC = () => {
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [touched, setTouched] = useState<Record<string, boolean>>({});
//
//   const handleErrorClick = (field: string) => {
//     const element = document.querySelector(`[name="${field}"]`);
//     element?.scrollIntoView({ behavior: 'smooth' });
//     element?.focus();
//   };
//
//   return (
//     <form>
//       <FormErrorSummary
//         errors={errors}
//         onErrorClick={handleErrorClick}
//         className="mb-6"
//       />
//
//       <div className="space-y-4">
//         <div>
//           <input
//             name="email"
//             onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
//           />
//           <FormFieldError
//             errors={errors}
//             name="email"
//             touched={touched}
//           />
//         </div>
//
//         <div>
//           <input
//             name="password"
//             type="password"
//             onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
//           />
//           <FormFieldError
//             errors={errors}
//             name="password"
//             touched={touched}
//           />
//         </div>
//       </div>
//     </form>
//   );
// };