import { useState, useCallback } from 'react';
import { useFormError } from '@/app/contexts/FormErrorContext';
import { APIError } from '@/app/utils/formErrors';
import * as yup from 'yup';

interface SubmitOptions<T, R> {
  onSuccess?: (response: R) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  onSettled?: () => void | Promise<void>;
  transform?: (data: T) => any;
  validationSchema?: yup.ObjectSchema<any>;
}

interface SubmitState<R> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: R | null;
  error: Error | null;
}

export function useFormSubmit<T extends Record<string, any>, R = any>(
  submitFn: (data: T) => Promise<R>,
  options: SubmitOptions<T, R> = {}
) {
  const {
    onSuccess,
    onError,
    onSettled,
    transform,
    validationSchema,
  } = options;

  const [state, setState] = useState<SubmitState<R>>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    data: null,
    error: null,
  });

  const { handleAPIErrors, clearErrors } = useFormError();

  const validateData = useCallback(
    async (data: T): Promise<boolean> => {
      if (!validationSchema) return true;

      try {
        await validationSchema.validate(data, { abortEarly: false });
        return true;
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          handleAPIErrors(
            error.inner.map((err) => ({
              field: err.path || '',
              message: err.message,
            }))
          );
        }
        return false;
      }
    },
    [validationSchema, handleAPIErrors]
  );

  const submit = useCallback(
    async (values: T) => {
      // Reset state
      setState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        data: null,
        error: null,
      });
      clearErrors();

      try {
        // Validate data if schema is provided
        if (validationSchema) {
          const isValid = await validateData(values);
          if (!isValid) {
            throw new Error('Form validation failed');
          }
        }

        // Transform data if needed
        const transformedData = transform ? transform(values) : values;

        // Submit form
        const response = await submitFn(transformedData);

        // Handle success
        setState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          data: response,
          error: null,
        });

        await onSuccess?.(response);
      } catch (error) {
        // Handle API errors
        if (Array.isArray((error as any)?.errors)) {
          handleAPIErrors((error as any).errors as APIError[]);
        }

        // Handle other errors
        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          data: null,
          error: error as Error,
        });

        await onError?.(error as Error);
      } finally {
        await onSettled?.();
      }
    },
    [
      submitFn,
      transform,
      validationSchema,
      validateData,
      onSuccess,
      onError,
      onSettled,
      clearErrors,
      handleAPIErrors,
    ]
  );

  return {
    ...state,
    submit,
  };
}

// Helper hook for optimistic updates
export function useOptimisticUpdate<T extends Record<string, any>, R = any>(
  submitFn: (data: T) => Promise<R>,
  options: SubmitOptions<T, R> & {
    optimisticUpdate: (data: T) => void;
    rollback: () => void;
  }
) {
  const { optimisticUpdate, rollback, ...submitOptions } = options;

  const formSubmit = useFormSubmit(submitFn, {
    ...submitOptions,
    onError: async (error) => {
      rollback();
      await options.onError?.(error);
    },
  });

  const submit = useCallback(
    async (values: T) => {
      optimisticUpdate(values);
      await formSubmit.submit(values);
    },
    [optimisticUpdate, formSubmit]
  );

  return {
    ...formSubmit,
    submit,
  };
}

// Example usage:
// const ExampleForm = () => {
//   const validationSchema = yup.object().shape({
//     email: yup.string().email().required(),
//     password: yup.string().min(6).required(),
//   });
//
//   const { submit, isLoading, isSuccess, error } = useFormSubmit(
//     async (data) => {
//       const response = await api.post('/endpoint', data);
//       return response.data;
//     },
//     {
//       validationSchema,
//       onSuccess: (response) => {
//         toast.success('Form submitted successfully!');
//         router.push('/success');
//       },
//       onError: (error) => {
//         toast.error(error.message);
//       },
//       transform: (data) => ({
//         ...data,
//         timestamp: new Date().toISOString(),
//       }),
//     }
//   );
//
//   return (
//     <form onSubmit={(e) => {
//       e.preventDefault();
//       submit(formData);
//     }}>
//       {/* Form fields */}
//       <Button type="submit" isLoading={isLoading}>
//         Submit
//       </Button>
//       {error && <FormError error={error.message} />}
//     </form>
//   );
// };