import React from 'react';
import Button from '../Button';

interface Step {
  title: string;
  description?: string;
  component: React.ReactNode;
  isOptional?: boolean;
}

interface FormStepperProps {
  steps: Step[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  className?: string;
  isStepValid?: (step: number) => boolean;
  allowSkipStep?: boolean;
}

const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  currentStep = 0,
  onStepChange,
  onComplete,
  className = '',
  isStepValid = () => true,
  allowSkipStep = false,
}) => {
  const [activeStep, setActiveStep] = React.useState(currentStep);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  React.useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setCompletedSteps((prev) => [...prev, activeStep]);
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      onStepChange?.(nextStep);

      if (nextStep === steps.length) {
        onComplete?.();
      }
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    onStepChange?.(prevStep);
  };

  const handleStepClick = (step: number) => {
    if (allowSkipStep || step < activeStep || completedSteps.includes(step - 1)) {
      setActiveStep(step);
      onStepChange?.(step);
    }
  };

  return (
    <div className={className}>
      {/* Steps indicator */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step, index) => {
            const isCurrent = index === activeStep;
            const isCompleted = completedSteps.includes(index);
            const isClickable = allowSkipStep || index < activeStep || completedSteps.includes(index - 1);

            return (
              <li key={index} className="md:flex-1">
                <button
                  type="button"
                  className={`
                    group flex flex-col border rounded-md py-2 px-4 hover:border-gray-300 md:pl-4 md:pr-6 w-full
                    ${isCurrent ? 'border-blue-600' : ''}
                    ${isCompleted ? 'border-green-600' : ''}
                    ${!isClickable ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                  onClick={() => isClickable && handleStepClick(index)}
                  disabled={!isClickable}
                >
                  <span className="flex items-center text-sm font-medium">
                    <span className={`
                      flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full
                      ${isCompleted ? 'bg-green-600' : isCurrent ? 'bg-blue-600' : 'bg-gray-300'}
                      text-white
                    `}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                      {step.title}
                    </span>
                    {step.isOptional && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        (Optional)
                      </span>
                    )}
                  </span>
                  {step.description && (
                    <span className="mt-0.5 ml-9 text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div className="mt-8">
        {steps[activeStep]?.component}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!isStepValid(activeStep)}
        >
          {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

// Example usage:
// const steps = [
//   {
//     title: 'Basic Information',
//     description: 'Your personal details',
//     component: <BasicInfoForm />,
//   },
//   {
//     title: 'Contact Details',
//     description: 'How to reach you',
//     component: <ContactForm />,
//     isOptional: true,
//   },
//   {
//     title: 'Review',
//     description: 'Review your information',
//     component: <ReviewForm />,
//   },
// ];
//
// const MultiStepForm = () => {
//   const [currentStep, setCurrentStep] = useState(0);
//
//   return (
//     <FormStepper
//       steps={steps}
//       currentStep={currentStep}
//       onStepChange={setCurrentStep}
//       onComplete={() => console.log('Form completed!')}
//       isStepValid={(step) => true} // Add your validation logic here
//     />
//   );
// };

export default FormStepper;