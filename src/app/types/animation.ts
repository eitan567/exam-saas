// Basic animation target types
export interface AnimationTarget {
  [key: string]: any;
  opacity?: number;
  scale?: number;
  x?: number | string;
  y?: number | string;
  rotate?: number;
  originX?: number;
  originY?: number;
  scaleX?: number;
  scaleY?: number;
}

// Base transition properties
interface BaseTransition {
  delay?: number;
  when?: 'beforeChildren' | 'afterChildren';
}

// Transition types
export interface SpringTransition extends BaseTransition {
  type: 'spring';
  stiffness?: number;
  damping?: number;
  mass?: number;
  bounce?: number;
  staggerChildren?: number;
  staggerDirection?: number;
  delayChildren?: number;
}

export interface TweenTransition extends BaseTransition {
  type: 'tween';
  duration?: number;
  ease?: string;
  staggerChildren?: number;
  staggerDirection?: number;
  delayChildren?: number;
}

// Combined transition type
export type AnimationTransition = SpringTransition | TweenTransition;

// Variant types
export interface Variant {
  [key: string]: any;
  transition?: AnimationTransition;
}

export interface Variants {
  [key: string]: Variant;
}

// Motion configuration
export interface MotionConfig {
  bounce: boolean;
  duration: number;
  stiffness: number;
  damping: number;
}

// Animation state types
export type AnimationState = 'initial' | 'animate' | 'exit' | 'hover' | 'tap' | 'focus' | 'hidden' | 'visible';

// Default animation settings
export const defaultSpringTransition: SpringTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const defaultTweenTransition: TweenTransition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut',
};

export const defaultConfig: MotionConfig = {
  bounce: true,
  duration: 0.3,
  stiffness: 500,
  damping: 30,
};

// Helper type for component props
export interface AnimationProps {
  initial?: AnimationState | AnimationTarget;
  animate?: AnimationState | AnimationTarget;
  exit?: AnimationState | AnimationTarget;
  variants?: Variants;
  transition?: AnimationTransition;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

// Common easing functions
export const easings = {
  linear: 'linear',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  easeInOut: 'easeInOut',
  circIn: 'circIn',
  circOut: 'circOut',
  circInOut: 'circInOut',
  backIn: 'backIn',
  backOut: 'backOut',
  backInOut: 'backInOut',
  anticipate: 'anticipate',
} as const;

export type Easing = keyof typeof easings;