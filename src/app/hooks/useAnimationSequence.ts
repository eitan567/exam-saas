import { useCallback, useRef, useState, useEffect } from 'react';
import { 
  AnimationTransition,
  SpringTransition, 
  TweenTransition,
  Variants,
} from '@/app/types/animation';

interface AnimationStep {
  name: string;
  variants: Variants;
  transition?: AnimationTransition;
  duration: number;
  onStart?: () => void;
  onComplete?: () => void;
}

interface SequenceOptions {
  loop: boolean;
  autoPlay: boolean;
  reducedMotion: boolean;
  onSequenceComplete(): void;
}

interface SequenceControls {
  play(): void;
  pause(): void;
  reset(): void;
  isPlaying: boolean;
  currentStep: AnimationStep | undefined;
  currentStepIndex: number;
  completedSteps: string[];
  variants: Variants;
}

interface AnimationConfig {
  options: SequenceOptions;
  steps: AnimationStep[];
}

const noop = () => {};

const DEFAULT_STEP: AnimationStep = {
  name: 'default',
  variants: {},
  transition: undefined,
  duration: 0,
  onStart: noop,
  onComplete: noop
};

const DEFAULT_OPTIONS: SequenceOptions = {
  loop: false,
  autoPlay: false,
  reducedMotion: false,
  onSequenceComplete: noop
};

const INITIAL_STEPS = ['__initial__'];

export function useAnimationSequence(config: AnimationConfig): SequenceControls {
  const options = {
    ...DEFAULT_OPTIONS,
    ...config.options
  };

  const steps = config.steps.length > 0 ? config.steps : [DEFAULT_STEP];
  const { loop, autoPlay, reducedMotion, onSequenceComplete } = options;

  const [playing, setPlaying] = useState(Boolean(autoPlay));
  const [stepIndex, setStepIndex] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([...INITIAL_STEPS]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const sequenceRef = useRef({
    loop,
    onSequenceComplete,
  });
  sequenceRef.current = { loop, onSequenceComplete };

  // Helper to create optimized transitions
  const createOptimizedTransition = useCallback(
    (transition?: AnimationTransition): AnimationTransition => {
      if (!transition) return reducedMotion 
        ? { type: 'tween', duration: 0.2 }
        : { type: 'spring', stiffness: 500, damping: 30 };

      if (reducedMotion) {
        return {
          ...transition,
          type: 'tween',
          duration: Math.min((transition as TweenTransition).duration || 0.3, 0.2),
        };
      }

      return transition;
    },
    [reducedMotion]
  );

  // Execute a single animation step
  const executeStep = useCallback((index: number) => {
    const step = stepsRef.current[index];
    if (!step) return;

    // Start step animation
    step.onStart?.();
    
    // Schedule step completion
    const duration = reducedMotion ? Math.min(step.duration, 0.2) : step.duration;
    timeoutRef.current = setTimeout(() => {
      // Mark step as completed
      setStepsCompleted(prev => [...prev, step.name]);

      // Handle step completion
      step.onComplete?.();

      // Move to next step or complete sequence
      if (index < stepsRef.current.length - 1) {
        setStepIndex(index + 1);
        executeStep(index + 1);
      } else {
        if (sequenceRef.current.loop) {
          setPlaying(true);
          setStepIndex(0);
          setStepsCompleted([...INITIAL_STEPS]);
          executeStep(0);
        } else {
          setPlaying(false);
          sequenceRef.current.onSequenceComplete();
        }
      }
    }, duration * 1000);
  }, [reducedMotion]);

  // Control functions
  const play = useCallback(() => {
    setPlaying(true);
    executeStep(stepIndex);
  }, [stepIndex, executeStep]);

  const pause = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPlaying(false);
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPlaying(false);
    setStepIndex(0);
    setStepsCompleted([...INITIAL_STEPS]);
  }, []);

  const getCurrentVariants = useCallback(() => {
    const currentStep = stepsRef.current[stepIndex];
    if (!currentStep) return {};

    return {
      ...currentStep.variants,
      transition: createOptimizedTransition(currentStep.transition),
    };
  }, [stepIndex, createOptimizedTransition]);

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay) {
      play();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [autoPlay, play]);

  return {
    play,
    pause,
    reset,
    isPlaying: playing,
    currentStep: stepsRef.current[stepIndex],
    currentStepIndex: stepIndex,
    completedSteps: stepsCompleted,
    variants: getCurrentVariants(),
  };
}