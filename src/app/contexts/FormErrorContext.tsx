import React, { createContext, useContext, useCallback, useState } from 'react';
import { FormErrors, APIError, FormErrorHandler } from '@/app/utils/formErrors';

interface FormErrorContextType {
  errors: FormErrors;
  touched: Record<string, boolean>;
  setFieldError: (field: string, error: string | null) => void;
  setFieldTouched: (field: string, isTouched?: boolean) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  setErrors: (errors: FormErrors) => void;
  handleYupError: (error: any) => void;
  handleAPIErrors: (errors: APIError[]) => void;
  hasErrors: boolean;
  getFieldError: (field: string) => string | null;
  isFieldTouched: (field: string) => boolean;
  resetTouched: () => void;
}

const FormErrorContext = createContext<FormErrorContextType | undefined>(undefined);

export function useFormError() {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFormError must be used within a FormErrorProvider');
  }
  return context;
}

export function useFieldError(field: string) {
  const { errors, touched, setFieldTouched } = useFormError();
  const error = FormErrorHandler.getFieldError(errors, field);
  const isTouched = FormErrorHandler.isFieldTouched(touched, field);

  const handleBlur = useCallback(() => {
    setFieldTouched(field, true);
  }, [field, setFieldTouched]);

  return {
    error: isTouched ? error : null,
    isTouched,
    handleBlur,
  };
}

interface FormErrorProviderProps {
  children: React.ReactNode;
  showUntouched?: boolean;
}

export function FormErrorProvider({
  children,
  showUntouched = false,
}: FormErrorProviderProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors((prev) => {
      if (!error) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: error };
    });
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleYupError = useCallback((error: any) => {
    if (error?.inner) {
      setErrors(FormErrorHandler.fromYupError(error));
    }
  }, []);

  const handleAPIErrors = useCallback((apiErrors: APIError[]) => {
    setErrors(FormErrorHandler.fromAPIErrors(apiErrors));
  }, []);

  const getFieldError = useCallback(
    (field: string) => {
      const error = FormErrorHandler.getFieldError(errors, field);
      if (!showUntouched && !touched[field]) {
        return null;
      }
      return error;
    },
    [errors, touched, showUntouched]
  );

  const isFieldTouched = useCallback(
    (field: string) => FormErrorHandler.isFieldTouched(touched, field),
    [touched]
  );

  const resetTouched = useCallback(() => {
    setTouched({});
  }, []);

  const value = {
    errors,
    touched,
    setFieldError,
    setFieldTouched,
    clearErrors,
    clearFieldError,
    setErrors,
    handleYupError,
    handleAPIErrors,
    hasErrors: FormErrorHandler.hasErrors(errors),
    getFieldError,
    isFieldTouched,
    resetTouched,
  };

  return (
    <FormErrorContext.Provider value={value}>
      {children}
    </FormErrorContext.Provider>
  );
}

// Example usage:
// export function ExampleForm() {
//   const { setFieldError, clearErrors, handleYupError } = useFormError();
//
//   const onSubmit = async (data: FormData) => {
//     try {
//       clearErrors();
//       await validationSchema.validate(data, { abortEarly: false });
//       // Submit form...
//     } catch (error) {
//       handleYupError(error);
//     }
//   };
//
//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <FormInput
//         name="email"
//         useErrorHook={() => useFieldError('email')}
//       />
//       <FormInput
//         name="password"
//         useErrorHook={() => useFieldError('password')}
//       />
//       <FormErrorSummary />
//     </form>
//   );
// }
//
// export function App() {
//   return (
//     <FormErrorProvider>
//       <ExampleForm />
//     </FormErrorProvider>
//   );
// }