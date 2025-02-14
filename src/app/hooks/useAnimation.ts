import { useEffect, useRef } from 'react';
import { 
  AnimationProps, 
  AnimationTransition,
  Variants,
  SpringTransition,
  TweenTransition,
} from '@/app/types/animation';
import { applyMotionPreferences } from '@/app/utils/animationPresets';

interface UseAnimationConfig {
  reducedMotion?: boolean;
  enableGestures?: boolean;
  repeat?: number | boolean;
  delay?: number;
}

interface GestureProps {
  whileHover?: string;
  whileTap?: string;
  whileFocus?: string;
}

interface UseAnimationCallbacks {
  onComplete?: () => void;
  onStart?: () => void;
}

type UseAnimationOptions = UseAnimationConfig & 
  Partial<AnimationProps> & 
  UseAnimationCallbacks;

interface UseAnimationResult {
  variants: Variants;
  animationProps: AnimationProps & Partial<GestureProps>;
  isAnimating: boolean;
  playAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

const createSpringTransition = (delay: number): SpringTransition => ({
  type: 'spring',
  stiffness: 500,
  damping: 30,
  delay,
});

const createTweenTransition = (delay: number): TweenTransition => ({
  type: 'tween',
  duration: 0.3,
  ease: 'easeOut',
  delay,
});

const mergeTransitions = (
  base: AnimationTransition,
  override?: Partial<SpringTransition> | Partial<TweenTransition>
): AnimationTransition => {
  if (!override) return base;

  if (base.type === 'spring' && 'stiffness' in override) {
    return {
      ...base,
      ...override,
      type: 'spring',
    } as SpringTransition;
  }

  if (base.type === 'tween' && 'duration' in override) {
    return {
      ...base,
      ...override,
      type: 'tween',
    } as TweenTransition;
  }

  return base;
};

export function useAnimation(
  baseVariants: Variants,
  options: UseAnimationOptions = {}
): UseAnimationResult {
  const {
    reducedMotion = false,
    enableGestures = false,
    repeat = false,
    delay = 0,
    onComplete,
    onStart,
    transition: customTransition,
    ...restOptions
  } = options;

  const isAnimatingRef = useRef(false);
  const animationCountRef = useRef(0);

  // Apply motion preferences
  const variants = applyMotionPreferences(baseVariants);

  // Handle animation completion
  const handleAnimationComplete = () => {
    isAnimatingRef.current = false;
    onComplete?.();

    if (repeat) {
      if (typeof repeat === 'number' && animationCountRef.current < repeat) {
        playAnimation();
      } else if (repeat === true) {
        playAnimation();
      }
    }
  };

  // Handle animation start
  const handleAnimationStart = () => {
    isAnimatingRef.current = true;
    animationCountRef.current += 1;
    onStart?.();
  };

  // Reset animation counter on unmount
  useEffect(() => {
    return () => {
      animationCountRef.current = 0;
    };
  }, []);

  // Create default transition based on reducedMotion preference
  const defaultTransition: AnimationTransition = reducedMotion
    ? createTweenTransition(delay)
    : createSpringTransition(delay);

  // Merge with custom transition if provided
  const transition = customTransition
    ? mergeTransitions(defaultTransition, customTransition)
    : defaultTransition;

  // Create base animation props
  const baseAnimationProps: AnimationProps = {
    ...restOptions,
    variants,
    transition,
    onAnimationComplete: handleAnimationComplete,
    onAnimationStart: handleAnimationStart,
  };

  // Add gesture animations if enabled
  const gestureProps: Partial<GestureProps> = enableGestures
    ? {
        whileHover: 'hover',
        whileTap: 'tap',
        whileFocus: 'focus',
      }
    : {};

  const animationProps = {
    ...baseAnimationProps,
    ...gestureProps,
  };

  // Animation control functions
  const playAnimation = () => {
    if (!isAnimatingRef.current) {
      handleAnimationStart();
    }
  };

  const stopAnimation = () => {
    isAnimatingRef.current = false;
  };

  const resetAnimation = () => {
    animationCountRef.current = 0;
    stopAnimation();
  };

  return {
    variants,
    animationProps,
    isAnimating: isAnimatingRef.current,
    playAnimation,
    stopAnimation,
    resetAnimation,
  };
}

// Example usage:
// const MyAnimatedComponent = () => {
//   const { animationProps } = useAnimation(slideUp, {
//     reducedMotion: true,
//     enableGestures: true,
//     repeat: 3,
//     delay: 0.2,
//     transition: { type: 'spring', stiffness: 400 },
//     onComplete: () => console.log('Animation complete'),
//   });
//
//   return (
//     <motion.div {...animationProps}>
//       Content
//     </motion.div>
//   );
// };