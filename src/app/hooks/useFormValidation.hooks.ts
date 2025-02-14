import { useState, useCallback, useEffect } from 'react';
import * as yup from 'yup';
import { useFormError } from '@/app/contexts/FormErrorContext';
import { FormConfig } from '@/app/utils/formUtils';
import { createYupSchema } from '@/app/utils/formUtils';

export interface ValidationOptions<T> {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  persistState?: {
    key: string;
    storage?: Storage;
    encrypt?: boolean;
    expireIn?: number;
  };
  onSuccess?: (values: T) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export interface ArrayField<T> {
  id: string | number;
  value: T;
}

export function useFormValidation<T extends Record<string, any>>(
  config: FormConfig<T>,
  validationSchema?: yup.ObjectSchema<any>,
  options: ValidationOptions<T> = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    persistState,
    onSuccess,
    onError,
  } = options;

  const [values, setValues] = useState<T>(() => {
    if (persistState) {
      const savedState = localStorage.getItem(persistState.key);
      if (savedState) {
        try {
          return JSON.parse(savedState) as T;
        } catch {
          return {} as T;
        }
      }
    }
    return {} as T;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleYupError, clearErrors, setFieldError, setFieldTouched } = useFormError();

  // Handle persistence
  useEffect(() => {
    if (persistState && Object.keys(values).length > 0) {
      localStorage.setItem(persistState.key, JSON.stringify(values));
    }
  }, [values, persistState]);

  // Validate single field
  const validateField = useCallback(
    async (name: keyof T, value: any) => {
      if (!validationSchema) return true;

      try {
        await validationSchema.validateAt(name as string, { [name]: value });
        setFieldError(name as string, null);
        return true;
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          setFieldError(name as string, error.message);
        }
        return false;
      }
    },
    [validationSchema, setFieldError]
  );

  // Handle field change
  const handleChange = useCallback(
    async (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      
      if (validateOnChange) {
        await validateField(name, value);
      }
    },
    [validateOnChange, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    async (name: keyof T) => {
      setFieldTouched(name as string, true);
      
      if (validateOnBlur) {
        await validateField(name, values[name]);
      }
    },
    [values, validateOnBlur, validateField, setFieldTouched]
  );

  // Validate entire form
  const validateForm = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      clearErrors();
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        handleYupError(error);
      }
      return false;
    }
  }, [values, validationSchema, clearErrors, handleYupError]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      clearErrors();

      try {
        const isValid = await validateForm();
        if (isValid) {
          await onSuccess?.(values);
          if (persistState) {
            localStorage.removeItem(persistState.key);
          }
        }
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, clearErrors, onSuccess, onError, persistState]
  );

  // Reset form
  const resetForm = useCallback(
    (newValues: Partial<T> = {}) => {
      setValues(newValues as T);
      clearErrors();
      if (persistState) {
        localStorage.removeItem(persistState.key);
      }
    },
    [clearErrors, persistState]
  );

  return {
    values,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    validateField,
    validateForm,
  };
}

export interface FieldArrayConfig<T, K extends keyof T> {
  name: K;
  minItems?: number;
  maxItems?: number;
}

export function useFieldArray<T extends Record<K, ArrayField<any>[]>, K extends keyof T>(
  config: FieldArrayConfig<T, K>,
  form?: ReturnType<typeof useFormValidation<T>>
) {
  const { name, minItems = 0, maxItems } = config;
  const { values, handleChange } = form || useFormValidation<T>({} as FormConfig<T>);
  const items = values[name] || [];

  const addItem = useCallback(
    (item: ArrayField<any>) => {
      if (maxItems && items.length >= maxItems) return;
      handleChange(name, [...items, item]);
    },
    [items, name, maxItems, handleChange]
  );

  const removeItem = useCallback(
    (id: string | number) => {
      if (items.length <= minItems) return;
      const newItems = items.filter(item => item.id !== id);
      handleChange(name, newItems);
    },
    [items, name, minItems, handleChange]
  );

  const updateItem = useCallback(
    (id: string | number, value: any) => {
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return;
      
      const newItems = [...items];
      newItems[index] = { ...newItems[index], value };
      handleChange(name, newItems);
    },
    [items, name, handleChange]
  );

  const moveItem = useCallback(
    (fromId: string | number, toId: string | number) => {
      const fromIndex = items.findIndex(item => item.id === fromId);
      const toIndex = items.findIndex(item => item.id === toId);
      
      if (fromIndex === -1 || toIndex === -1) return;
      
      const newItems = [...items];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      handleChange(name, newItems);
    },
    [items, name, handleChange]
  );

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    hasMinItems: items.length <= minItems,
    hasMaxItems: maxItems ? items.length >= maxItems : false,
  };
}