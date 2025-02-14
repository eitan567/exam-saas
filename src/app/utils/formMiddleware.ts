import { FormConfig } from './formUtils';

export type FormMiddleware<T extends Record<string, any>> = (
  state: T,
  action: FormAction<T>,
  next: (state: T) => void
) => void;

export type FormAction<T extends Record<string, any>> = {
  type: 'SET_VALUE' | 'SET_VALUES' | 'RESET' | 'CLEAR' | 'VALIDATE' | 'SUBMIT' | 'CUSTOM';
  payload?: any;
  field?: keyof T;
  meta?: Record<string, any>;
};

export interface FormMiddlewareConfig<T extends Record<string, any>> {
  onError?: (error: Error) => void;
  logger?: (action: FormAction<T>, prevState: T, nextState: T) => void;
}

export class FormMiddlewareManager<T extends Record<string, any>> {
  private middlewares: FormMiddleware<T>[] = [];
  private config: FormMiddlewareConfig<T>;

  constructor(config: FormMiddlewareConfig<T> = {}) {
    this.config = config;
  }

  use(middleware: FormMiddleware<T>) {
    this.middlewares.push(middleware);
    return this;
  }

  execute(state: T, action: FormAction<T>, finalHandler: (state: T) => void) {
    let index = 0;
    const prevState = { ...state };

    const next = (nextState: T) => {
      try {
        if (index < this.middlewares.length) {
          this.middlewares[index++](nextState, action, next);
        } else {
          // Log state changes if logger is configured
          if (this.config.logger) {
            this.config.logger(action, prevState, nextState);
          }
          finalHandler(nextState);
        }
      } catch (error) {
        this.config.onError?.(error as Error);
      }
    };

    next(state);
  }
}

// Built-in middlewares
export const createValidationMiddleware = <T extends Record<string, any>>(
  config: FormConfig<T>
): FormMiddleware<T> => {
  return (state, action, next) => {
    if (action.type === 'VALIDATE' || action.type === 'SUBMIT') {
      // Add validation logic here
      // You can access validation rules from the config
    }
    next(state);
  };
};

export const createPersistenceMiddleware = <T extends Record<string, any>>(
  key: string,
  storage = localStorage
): FormMiddleware<T> => {
  return (state, action, next) => {
    next(state);
    if (action.type !== 'CUSTOM') {
      storage.setItem(key, JSON.stringify(state));
    }
  };
};

export const createDebounceMiddleware = <T extends Record<string, any>>(
  wait = 300
): FormMiddleware<T> => {
  let timeout: NodeJS.Timeout;
  return (state, action, next) => {
    if (action.type === 'SET_VALUE') {
      clearTimeout(timeout);
      timeout = setTimeout(() => next(state), wait);
    } else {
      next(state);
    }
  };
};

export const createLoggerMiddleware = <T extends Record<string, any>>(): FormMiddleware<T> => {
  return (state, action, next) => {
    console.group(`Form Action: ${action.type}`);
    console.log('Prev State:', state);
    next(state);
    console.log('Next State:', state);
    console.log('Action:', action);
    console.groupEnd();
  };
};

export interface FormHistoryState<T extends Record<string, any>> {
  past: T[];
  present: T;
  future: T[];
}

export const createUndoRedoMiddleware = <T extends Record<string, any>>(): FormMiddleware<T> => {
  const history: FormHistoryState<T> = {
    past: [],
    present: {} as T,
    future: [],
  };

  return (state, action, next) => {
    if (action.type === 'CUSTOM') {
      switch (action.meta?.type) {
        case 'UNDO':
          if (history.past.length > 0) {
            const previous = history.past[history.past.length - 1];
            const newPast = history.past.slice(0, -1);
            
            history.future = [history.present, ...history.future];
            history.past = newPast;
            history.present = previous;
            
            next(previous);
          }
          break;
          
        case 'REDO':
          if (history.future.length > 0) {
            const next_ = history.future[0];
            const newFuture = history.future.slice(1);
            
            history.past = [...history.past, history.present];
            history.future = newFuture;
            history.present = next_;
            
            next(next_);
          }
          break;

        default:
          next(state);
      }
    } else {
      history.past = [...history.past, history.present];
      history.present = state;
      history.future = [];
      next(state);
    }
  };
};

// Type safe action creators
export const formActions = {
  setValue: <T extends Record<string, any>>(field: keyof T, value: any): FormAction<T> => ({
    type: 'SET_VALUE',
    field,
    payload: value,
  }),
  
  setValues: <T extends Record<string, any>>(values: Partial<T>): FormAction<T> => ({
    type: 'SET_VALUES',
    payload: values,
  }),
  
  reset: <T extends Record<string, any>>(): FormAction<T> => ({
    type: 'RESET',
  }),
  
  validate: <T extends Record<string, any>>(fields?: Array<keyof T>): FormAction<T> => ({
    type: 'VALIDATE',
    payload: fields,
  }),
  
  undo: <T extends Record<string, any>>(): FormAction<T> => ({
    type: 'CUSTOM',
    meta: { type: 'UNDO' },
  }),
  
  redo: <T extends Record<string, any>>(): FormAction<T> => ({
    type: 'CUSTOM',
    meta: { type: 'REDO' },
  }),
};

// Example usage:
// interface FormData {
//   email: string;
//   password: string;
// }
//
// const middleware = new FormMiddlewareManager<FormData>()
//   .use(createValidationMiddleware(formConfig))
//   .use(createDebounceMiddleware(500))
//   .use(createPersistenceMiddleware('form_state'))
//   .use(createUndoRedoMiddleware())
//   .use(createLoggerMiddleware());
//
// middleware.execute(
//   currentState,
//   formActions.setValue('email', 'test@example.com'),
//   setValues
// );