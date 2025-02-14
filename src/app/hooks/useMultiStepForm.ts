import { useState, useCallback, useMemo } from 'react';
import * as yup from 'yup';

export interface Step<T> {
  id: string;
  validationSchema?: yup.ObjectSchema<any>;
  dependencies?: (keyof T)[];
  isOptional?: boolean;
}

interface UseMultiStepFormOptions<T> {
  steps: Step<T>[];
  initialValues: T;
  onComplete: (values: T) => void | Promise<void>;
}

interface StepState {
  isValid: boolean;
  isComplete: boolean;
  errors: Record<string, string>;
}

type StepValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export function useMultiStepForm<T extends Record<string, any>>({
  steps,
  initialValues,
  onComplete,
}: UseMultiStepFormOptions<T>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [values, setValues] = useState<T>(initialValues);
  const [stepsState, setStepsState] = useState<Record<string, StepState>>(() =>
    steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: {
        isValid: false,
        isComplete: false,
        errors: {},
      },
    }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = useCallback(async (stepIndex: number, stepValues: Partial<T>): Promise<StepValidationResult> => {
    const step = steps[stepIndex];
    if (!step.validationSchema) {
      return { isValid: true, errors: {} };
    }

    try {
      await step.validationSchema.validate(stepValues, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: {} };
    }
  }, [steps]);

  const updateStepState = useCallback(async (stepIndex: number) => {
    const step = steps[stepIndex];
    const stepValues = step.dependencies
      ? step.dependencies.reduce((acc, key) => ({
          ...acc,
          [key]: values[key],
        }), {})
      : values;

    const { isValid, errors } = await validateStep(stepIndex, stepValues);
    
    setStepsState((prev) => ({
      ...prev,
      [step.id]: {
        ...prev[step.id],
        isValid,
        errors,
        isComplete: step.isOptional ? true : isValid,
      },
    }));

    return isValid;
  }, [steps, values, validateStep]);

  const setFieldValue = useCallback(async (name: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Find steps that depend on this field and validate them
    steps.forEach((step, index) => {
      if (step.dependencies?.includes(name as keyof T)) {
        updateStepState(index);
      }
    });
  }, [steps, updateStepState]);

  const canProceed = useMemo(() => {
    const currentStep = steps[currentStepIndex];
    return currentStep.isOptional || stepsState[currentStep.id].isValid;
  }, [steps, currentStepIndex, stepsState]);

  const nextStep = useCallback(async () => {
    const isValid = await updateStepState(currentStepIndex);
    if (isValid || steps[currentStepIndex].isOptional) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        return true;
      }
    }
    return false;
  }, [currentStepIndex, steps, updateStepState]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      return true;
    }
    return false;
  }, [currentStepIndex]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
      return true;
    }
    return false;
  }, [steps.length]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Validate all steps
      const validations = await Promise.all(
        steps.map((_, index) => updateStepState(index))
      );

      if (validations.every((isValid) => isValid)) {
        await onComplete(values);
        return true;
      }
    } finally {
      setIsSubmitting(false);
    }
    return false;
  }, [steps, updateStepState, values, onComplete]);

  return {
    currentStepIndex,
    values,
    errors: stepsState[steps[currentStepIndex].id].errors,
    isValid: canProceed,
    isSubmitting,
    stepsState,
    setFieldValue,
    nextStep,
    previousStep,
    goToStep,
    handleSubmit,
  };
}