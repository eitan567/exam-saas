import { useMemo, useRef, useCallback } from 'react';
import { useAnimation } from './useAnimation';
import { useFormAnimation } from './useFormAnimation';
import { 
  Variants, 
  AnimationTransition,
  SpringTransition,
  TweenTransition,
  AnimationState,
} from '@/app/types/animation';

interface FormGroupElement {
  id: string;
  type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'button';
  index: number;
}

interface FormGroupAnimationOptions {
  elements: FormGroupElement[];
  isExpanded?: boolean;
  direction?: 'vertical' | 'horizontal';
  staggerDelay?: number;
  reducedMotion?: boolean;
  onGroupAnimationComplete?: () => void;
}

interface FormGroupAnimationState {
  activeElementId: string | null;
  isAnimating: boolean;
  isExpanded: boolean;
}

type GroupAnimationState = 'visible' | 'hidden' | 'expanded' | 'collapsed';

const createTweenTransition = (duration: number): TweenTransition => ({
  type: 'tween',
  duration,
  ease: 'easeInOut',
});

const createGroupTransition = (
  staggerDelay: number,
  reducedMotion: boolean
): SpringTransition => ({
  type: 'spring',
  stiffness: reducedMotion ? 500 : 400,
  damping: reducedMotion ? 35 : 30,
  staggerChildren: reducedMotion ? staggerDelay / 2 : staggerDelay,
  delayChildren: 0.1,
  mass: 1,
});

const createGroupVariants = (
  direction: 'vertical' | 'horizontal',
  isExpanded: boolean
): Variants => ({
  hidden: {
    opacity: 0,
    [direction === 'vertical' ? 'height' : 'width']: 0,
    transition: createTweenTransition(0.2),
  },
  visible: {
    opacity: 1,
    [direction === 'vertical' ? 'height' : 'width']: 'auto',
    transition: createTweenTransition(0.3),
  },
  collapsed: {
    opacity: isExpanded ? 1 : 0,
    [direction === 'vertical' ? 'height' : 'width']: isExpanded ? 'auto' : 0,
    transition: createTweenTransition(0.3),
  },
  expanded: {
    opacity: 1,
    [direction === 'vertical' ? 'height' : 'width']: 'auto',
    transition: createTweenTransition(0.3),
  },
});

export function useFormGroupAnimation({
  elements,
  isExpanded = true,
  direction = 'vertical',
  staggerDelay = 0.05,
  reducedMotion = false,
  onGroupAnimationComplete,
}: FormGroupAnimationOptions) {
  const stateRef = useRef<FormGroupAnimationState>({
    activeElementId: null,
    isAnimating: false,
    isExpanded,
  });

  // Create group variants with stagger effect
  const groupVariants = useMemo(() => {
    const baseVariants = createGroupVariants(direction, isExpanded);
    const transition = createGroupTransition(staggerDelay, reducedMotion);

    return {
      ...baseVariants,
      visible: {
        ...baseVariants.visible,
        transition,
      },
      expanded: {
        ...baseVariants.expanded,
        transition,
      },
    };
  }, [direction, isExpanded, staggerDelay, reducedMotion]);

  // Set up group animation
  const groupAnimation = useAnimation(groupVariants, {
    reducedMotion,
    onComplete: onGroupAnimationComplete,
  });

  // Create element animations with coordinated timing
  const elementAnimations = useMemo(() => {
    return elements.map((element) => {
      const delay = reducedMotion ? 0 : element.index * staggerDelay;
      
      return useFormAnimation({
        type: element.type,
        reducedMotion,
        customVariants: {
          ...groupVariants,
          visible: {
            ...groupVariants.visible,
            transition: {
              ...(groupVariants.visible.transition as SpringTransition),
              delay,
            },
          },
        },
      });
    });
  }, [elements, groupVariants, reducedMotion, staggerDelay]);

  // Handle coordinated animations
  const animateGroup = useCallback((state: GroupAnimationState) => {
    stateRef.current.isAnimating = true;
    
    // Type assertion to handle custom animation states
    const animationState = state as unknown as AnimationState;
    groupAnimation.animationProps.animate = animationState;
    
    elementAnimations.forEach(({ playAnimation }) => playAnimation());
  }, [groupAnimation, elementAnimations]);

  const setActiveElement = useCallback((elementId: string | null) => {
    stateRef.current.activeElementId = elementId;
    
    if (elementId) {
      const elementIndex = elements.findIndex(e => e.id === elementId);
      if (elementIndex !== -1) {
        elementAnimations[elementIndex].playAnimation();
      }
    }
  }, [elements, elementAnimations]);

  return {
    groupAnimation,
    elementAnimations,
    animateGroup,
    setActiveElement,
    isAnimating: stateRef.current.isAnimating,
    activeElementId: stateRef.current.activeElementId,
  };
}

// Example usage:
// const FormGroup = ({ children }) => {
//   const elements = [
//     { id: 'name', type: 'input', index: 0 },
//     { id: 'email', type: 'input', index: 1 },
//     { id: 'message', type: 'textarea', index: 2 },
//   ];
//
//   const { 
//     groupAnimation,
//     elementAnimations,
//     animateGroup,
//     setActiveElement,
//   } = useFormGroupAnimation({
//     elements,
//     isExpanded: true,
//     direction: 'vertical',
//     staggerDelay: 0.05,
//   });
//
//   return (
//     <motion.div {...groupAnimation.animationProps}>
//       {React.Children.map(children, (child, index) => {
//         const animation = elementAnimations[index];
//         return React.cloneElement(child, {
//           ...animation.animationProps,
//           onFocus: () => setActiveElement(elements[index].id),
//           onBlur: () => setActiveElement(null),
//         });
//       })}
//     </motion.div>
//   );
// };