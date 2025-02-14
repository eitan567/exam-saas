import React from 'react';
import { Step, useMultiStepForm } from '@/app/hooks/useMultiStepForm';
import FormStepper from './FormStepper';
import Card from '../Card';
import Button from '../Button';

interface WizardStepProps<T> {
  values: T;
  errors: Record<string, string>;
  setFieldValue: (name: string, value: any) => void;
}

interface WizardStep<T> {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<WizardStepProps<T>>;
  validationSchema?: any;
  dependencies?: (keyof T)[];
  isOptional?: boolean;
}

interface FormWizardProps<T extends Record<string, any>> {
  title?: string;
  description?: string;
  steps: WizardStep<T>[];
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  className?: string;
  showStepsProgress?: boolean;
  allowSkipStep?: boolean;
  submitButtonText?: string;
}

function FormWizard<T extends Record<string, any>>({
  title,
  description,
  steps,
  initialValues,
  onSubmit,
  className = '',
  showStepsProgress = true,
  allowSkipStep = false,
  submitButtonText = 'Submit',
}: FormWizardProps<T>) {
  const {
    currentStepIndex,
    values,
    errors,
    isValid,
    isSubmitting,
    stepsState,
    setFieldValue,
    nextStep,
    previousStep,
    goToStep,
    handleSubmit,
  } = useMultiStepForm({
    steps: steps.map(({ id, validationSchema, dependencies, isOptional }) => ({
      id,
      validationSchema,
      dependencies,
      isOptional,
    })),
    initialValues,
    onComplete: onSubmit,
  });

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNextClick = async () => {
    if (isLastStep) {
      await handleSubmit();
    } else {
      await nextStep();
    }
  };

  const StepComponent = currentStep.component;

  return (
    <div className={className}>
      {title && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {showStepsProgress && (
        <FormStepper
          steps={steps.map((step) => ({
            title: step.title,
            description: step.description,
            component: null,
            isOptional: step.isOptional,
          }))}
          currentStep={currentStepIndex}
          onStepChange={allowSkipStep ? goToStep : undefined}
          isStepValid={(index) => stepsState[steps[index].id].isValid}
          allowSkipStep={allowSkipStep}
          className="mb-8"
        />
      )}

      <Card className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentStep.title}
          </h3>
          {currentStep.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {currentStep.description}
            </p>
          )}
        </div>

        <StepComponent
          values={values}
          errors={errors}
          setFieldValue={setFieldValue}
        />
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={previousStep}
          disabled={currentStepIndex === 0}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleNextClick}
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
        >
          {isLastStep ? submitButtonText : 'Next'}
        </Button>
      </div>
    </div>
  );
}

// Example Step Component:
// interface PersonalInfoProps extends WizardStepProps<FormData> {}
//
// const PersonalInfoStep: React.FC<PersonalInfoProps> = ({
//   values,
//   errors,
//   setFieldValue,
// }) => {
//   return (
//     <div className="space-y-4">
//       <FormGroup label="Name" error={errors.name}>
//         <FormInput
//           value={values.name}
//           onChange={(e) => setFieldValue('name', e.target.value)}
//         />
//       </FormGroup>
//       <FormGroup label="Email" error={errors.email}>
//         <FormInput
//           type="email"
//           value={values.email}
//           onChange={(e) => setFieldValue('email', e.target.value)}
//         />
//       </FormGroup>
//     </div>
//   );
// };

export default FormWizard;