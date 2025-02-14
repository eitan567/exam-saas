'use client';

import { useState, useCallback } from 'react';
import * as Yup from 'yup';

interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
}

function isYupError(error: unknown): error is Yup.ValidationError {
  return error instanceof Yup.ValidationError;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: Yup.ObjectSchema<any>,
  initialValues: T
) {
  const [state, setState] = useState<ValidationState>({
    errors: {},
    isValid: true,
  });

  const validateField = useCallback(
    async (name: keyof T, value: any) => {
      try {
        await schema.validateAt(name as string, { [name]: value });
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: '',
          },
          isValid: Object.values(prev.errors).every((error) => !error),
        }));
      } catch (err: unknown) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: isYupError(err) ? err.message : 'Validation failed',
          },
          isValid: false,
        }));
      }
    },
    [schema]
  );

  const validateForm = useCallback(
    async (values: T) => {
      try {
        await schema.validate(values, { abortEarly: false });
        setState({ errors: {}, isValid: true });
        return true;
      } catch (err: unknown) {
        if (isYupError(err)) {
          const errors: Record<string, string> = {};
          err.inner.forEach((validationError) => {
            if (validationError.path) {
              errors[validationError.path] = validationError.message;
            }
          });
          setState({ errors, isValid: false });
        } else {
          setState({
            errors: { form: 'Form validation failed' },
            isValid: false,
          });
        }
        return false;
      }
    },
    [schema]
  );

  return {
    errors: state.errors,
    isValid: state.isValid,
    validateField,
    validateForm,
  };
}