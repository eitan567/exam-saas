import {
  Variants,
  AnimationTransition,
  SpringTransition,
  TweenTransition,
  MotionConfig,
  defaultSpringTransition,
  defaultTweenTransition,
  defaultConfig,
} from '@/app/types/animation';

// Base transitions with stagger support
const baseSpringTransition: SpringTransition = {
  ...defaultSpringTransition,
  staggerChildren: 0.05,
  delayChildren: 0,
};

const baseTweenTransition: TweenTransition = {
  ...defaultTweenTransition,
  staggerChildren: 0.05,
  delayChildren: 0,
};

// Basic fade animations
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: baseTweenTransition,
  },
  exit: { 
    opacity: 0,
    transition: baseTweenTransition,
  },
};

// Slide animations with different directions
export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: baseSpringTransition,
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: baseSpringTransition,
  },
};

export const slideDown: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: baseSpringTransition,
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: baseSpringTransition,
  },
};

export const slideLeft: Variants = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: baseSpringTransition,
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: baseSpringTransition,
  },
};

export const slideRight: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: baseSpringTransition,
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: baseSpringTransition,
  },
};

// Scale animations
export const scale: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: baseSpringTransition,
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: baseSpringTransition,
  },
};

// Common transition configurations
export const transitions: Record<string, AnimationTransition> = {
  spring: defaultSpringTransition,
  smooth: defaultTweenTransition,
  bounce: {
    type: 'spring',
    stiffness: 300,
    damping: 10,
  },
};

// List item animations with stagger
export const list: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...baseTweenTransition,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      ...baseTweenTransition,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: baseSpringTransition,
  },
  exit: { opacity: 0, x: 20 },
};

// Progress bar animations
export const progress: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: { 
    scaleX: 1,
    transition: {
      ...defaultTweenTransition,
      duration: 0.5,
    },
  },
};

// Card hover animations
export const cardHover: Variants = {
  initial: {},
  hover: { 
    scale: 1.02,
    transition: defaultTweenTransition,
  },
  tap: { scale: 0.98 },
};

// Helpers for creating staggered animations
export const createStaggeredVariants = (
  staggerDelay = 0.05,
  exitStaggerDelay = 0.03,
  baseVariants: Variants = fade
): Variants => {
  return {
    hidden: baseVariants.hidden || {},
    visible: {
      ...(baseVariants.visible || {}),
      transition: {
        ...defaultSpringTransition,
        staggerChildren: staggerDelay,
      },
    },
    exit: {
      ...(baseVariants.exit || {}),
      transition: {
        ...defaultSpringTransition,
        staggerChildren: exitStaggerDelay,
        staggerDirection: -1,
      },
    },
  };
};

// Helper for applying motion preferences
export const applyMotionPreferences = (
  variants: Variants,
  config: Partial<MotionConfig> = defaultConfig
): Variants => {
  const result: Variants = {};
  const baseTransition: SpringTransition = {
    type: 'spring',
    stiffness: config.stiffness ?? defaultConfig.stiffness,
    damping: config.damping ?? defaultConfig.damping,
  };

  Object.entries(variants).forEach(([key, value]) => {
    if (value) {
      result[key] = {
        ...value,
        transition: value.transition ? {
          ...baseTransition,
          ...value.transition,
        } : baseTransition,
      };
    }
  });

  return result;
};

// Animation builders for common patterns
export const createFadeVariants = (duration = defaultConfig.duration): Variants => ({
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      ...defaultTweenTransition,
      duration,
    },
  },
  exit: { 
    opacity: 0,
    transition: {
      ...defaultTweenTransition,
      duration: duration * 0.75,
    },
  },
});

export const createSlideVariants = (
  direction: 'up' | 'down' | 'left' | 'right',
  distance = 20
): Variants => {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const sign = direction === 'down' || direction === 'right' ? 1 : -1;

  return {
    hidden: { [axis]: distance * sign * -1, opacity: 0 },
    visible: { 
      [axis]: 0,
      opacity: 1,
      transition: baseSpringTransition,
    },
    exit: { 
      [axis]: distance * sign,
      opacity: 0,
      transition: baseSpringTransition,
    },
  };
};