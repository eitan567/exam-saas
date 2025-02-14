import { useMemo } from 'react';
import { useAnimation } from './useAnimation';
import { 
  Variants, 
  AnimationTransition,
  SpringTransition,
  TweenTransition,
  Variant,
} from '@/app/types/animation';

type FormElementType = 
  | 'input'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'button'
  | 'error'
  | 'label'
  | 'group';

interface FormAnimationOptions {
  type?: FormElementType;
  showError?: boolean;
  isValid?: boolean;
  isFocused?: boolean;
  isDisabled?: boolean;
  reducedMotion?: boolean;
  customVariants?: Variants;
}

// Transition presets optimized for form elements
const formTransitions: Record<FormElementType, AnimationTransition> = {
  input: {
    type: 'spring',
    stiffness: 700,
    damping: 30,
  } as SpringTransition,
  select: {
    type: 'spring',
    stiffness: 500,
    damping: 25,
  } as SpringTransition,
  textarea: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  } as SpringTransition,
  checkbox: {
    type: 'spring',
    stiffness: 800,
    damping: 20,
  } as SpringTransition,
  radio: {
    type: 'spring',
    stiffness: 800,
    damping: 20,
  } as SpringTransition,
  button: {
    type: 'spring',
    stiffness: 600,
    damping: 25,
  } as SpringTransition,
  error: {
    type: 'spring',
    stiffness: 900,
    damping: 30,
  } as SpringTransition,
  label: {
    type: 'tween',
    duration: 0.2,
  } as TweenTransition,
  group: {
    type: 'spring',
    stiffness: 500,
    damping: 35,
    staggerChildren: 0.05,
  } as SpringTransition,
};

// Helper to create a spring transition
const createSpringTransition = (
  config: Partial<Omit<SpringTransition, 'type'>>
): SpringTransition => ({
  type: 'spring',
  ...config,
});

// Helper to create error animation variant
const createErrorVariant = (showError: boolean): Partial<Variant> => {
  if (!showError) return {};

  return {
    scale: 1.02,
    x: [0, -2, 2, -2, 2, 0],
    transition: createSpringTransition({
      stiffness: 900,
      damping: 10,
    }),
  };
};

// Form element variants
const createFormVariants = (
  type: FormElementType,
  showError: boolean,
  isValid: boolean,
  isDisabled: boolean
): Variants => {
  const baseVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    hover: isDisabled ? {} : { scale: 1.02 },
    tap: isDisabled ? {} : { scale: 0.98 },
    focus: { scale: 1.02 },
  };

  const errorVariant = createErrorVariant(showError);

  const validVariant: Partial<Variant> = isValid ? {
    scale: 1,
    transition: createSpringTransition({
      stiffness: 600,
      damping: 30,
    }),
  } : {};

  const disabledVariant: Partial<Variant> = isDisabled ? {
    opacity: 0.6,
    scale: 1,
    filter: 'grayscale(100%)',
  } : {};

  return {
    ...baseVariants,
    animate: {
      ...baseVariants.visible,
      ...errorVariant,
      ...validVariant,
      ...disabledVariant,
      transition: formTransitions[type],
    },
  };
};

export interface UseFormAnimationResult {
  animationProps: ReturnType<typeof useAnimation>['animationProps'];
  variants: Variants;
  isAnimating: boolean;
  playAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  isError: boolean;
  isValid: boolean;
  isFocused: boolean;
  isDisabled: boolean;
}

export function useFormAnimation({
  type = 'input',
  showError = false,
  isValid = false,
  isFocused = false,
  isDisabled = false,
  reducedMotion = false,
  customVariants,
}: FormAnimationOptions = {}): UseFormAnimationResult {
  // Memoize variants to prevent unnecessary recalculations
  const variants = useMemo(
    () => customVariants || createFormVariants(type, showError, isValid, isDisabled),
    [type, showError, isValid, isDisabled, customVariants]
  );

  // Use base animation hook with form-specific configuration
  const animation = useAnimation(variants, {
    reducedMotion,
    enableGestures: !isDisabled,
    transition: formTransitions[type],
  });

  // Return animation props and additional form-specific states
  return {
    ...animation,
    isError: showError,
    isValid,
    isFocused,
    isDisabled,
  };
}

// Example usage:
// const FormInput = ({ label, error, ...props }) => {
//   const { animationProps, isError } = useFormAnimation({
//     type: 'input',
//     showError: !!error,
//     isValid: !error,
//     isDisabled: props.disabled,
//   });
//
//   return (
//     <motion.div {...animationProps}>
//       <label>{label}</label>
//       <input {...props} className={isError ? 'error' : ''} />
//       {error && <span className="error">{error}</span>}
//     </motion.div>
//   );
// };