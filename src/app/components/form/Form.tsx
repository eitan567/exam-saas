'use client';

import React, { createContext, useContext, useCallback } from 'react';

// Define simplified types to avoid yup import issues
type ValidationError = {
  path?: string;
  message: string;
  inner: ValidationError[];
};

type Schema<T> = {
  validateAt: (path: string, value: any) => Promise<any>;
  validate: (values: any, options: { abortEarly: boolean }) => Promise<T>;
};

interface FormContextType<T> {
  register: (name: keyof T) => {
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
    name: string;
    value: any;
  };
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

interface FormProps<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: Schema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  children: (props: FormContextType<T>) => React.ReactNode;
  className?: string;
}

const FormContext = createContext<FormContextType<any> | undefined>(undefined);

export const useForm = <T extends Record<string, any>>() => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context as FormContextType<T>;
};

export function Form<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  className = ''
}: FormProps<T>) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateField = useCallback(async (name: keyof T, value: any) => {
    if (!validationSchema) return;

    try {
      await validationSchema.validateAt(String(name), { [name]: value });
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (err) {
      const error = err as ValidationError;
      setErrors(prev => ({ ...prev, [name]: error.message }));
    }
  }, [validationSchema]);

  const register = useCallback((name: keyof T) => {
    return {
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : e.target.value;
        setValues(prev => ({ ...prev, [name]: value }));
        void validateField(name, value);
      },
      onBlur: () => {
        setTouched(prev => ({ ...prev, [name]: true }));
        void validateField(name, values[name]);
      },
      name: String(name),
      value: values[name]
    };
  }, [values, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (validationSchema) {
        const validatedValues = await validationSchema.validate(values, { abortEarly: false });
        await onSubmit(validatedValues);
      } else {
        await onSubmit(values);
      }
    } catch (err) {
      const error = err as ValidationError;
      const newErrors: Partial<Record<keyof T, string>> = {};
      error.inner.forEach((validationError) => {
        if (validationError.path) {
          newErrors[validationError.path as keyof T] = validationError.message;
        }
      });
      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: FormContextType<T> = {
    register,
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children(contextValue)}
      </form>
    </FormContext.Provider>
  );
}

export default Form;