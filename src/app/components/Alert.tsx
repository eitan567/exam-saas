import React from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onDismiss,
  className = ''
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-400',
      icon: 'text-green-400',
      title: 'text-green-800 dark:text-green-400',
      message: 'text-green-700 dark:text-green-300',
      iconPath: (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      )
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-400',
      icon: 'text-red-400',
      title: 'text-red-800 dark:text-red-400',
      message: 'text-red-700 dark:text-red-300',
      iconPath: (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      )
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400',
      icon: 'text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-400',
      message: 'text-yellow-700 dark:text-yellow-300',
      iconPath: (
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      )
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-400',
      icon: 'text-blue-400',
      title: 'text-blue-800 dark:text-blue-400',
      message: 'text-blue-700 dark:text-blue-300',
      iconPath: (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-10a1 1 0 10-2 0v4a1 1 0 102 0V8zm-1 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      )
    }
  };

  return (
    <div className={`rounded-md border p-4 ${variants[variant].container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${variants[variant].icon}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            {variants[variant].iconPath}
          </svg>
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${variants[variant].title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${variants[variant].message} ${title ? 'mt-2' : ''}`}>
            {message}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${variants[variant].icon} hover:bg-${variant}-100 dark:hover:bg-${variant}-900/40 focus:outline-none focus:ring-2 focus:ring-${variant}-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;