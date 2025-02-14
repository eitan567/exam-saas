import { ValidationRule } from './formUtils';

export const validationPatterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
} as const;

export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be at most ${max}`,
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
  password: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
  phone: 'Please enter a valid phone number',
  username: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores',
  match: (field: string) => `Must match ${field}`,
  integer: 'Must be a whole number',
  positive: 'Must be a positive number',
  date: 'Please enter a valid date',
  future: 'Date must be in the future',
  past: 'Date must be in the past',
} as const;

export const commonRules: Record<string, ValidationRule> = {
  required: {
    required: validationMessages.required,
  },
  email: {
    required: validationMessages.required,
    email: validationMessages.email,
  },
  url: {
    required: validationMessages.required,
    url: validationMessages.url,
  },
  password: {
    required: validationMessages.required,
    minLength: 8,
    pattern: {
      value: validationPatterns.password,
      message: validationMessages.password,
    },
  },
  phone: {
    required: validationMessages.required,
    pattern: {
      value: validationPatterns.phone,
      message: validationMessages.phone,
    },
  },
  username: {
    required: validationMessages.required,
    pattern: {
      value: validationPatterns.username,
      message: validationMessages.username,
    },
  },
} as const;

export const createPasswordConfirmRule = (passwordField: string): ValidationRule => ({
  required: validationMessages.required,
  validate: (value: string) => {
    const form = document.querySelector('form');
    if (!form) return true;
    const passwordInput = form.querySelector(`[name="${passwordField}"]`) as HTMLInputElement;
    if (!passwordInput) return true;
    return value === passwordInput.value || validationMessages.match(passwordField);
  },
});

export const dateRules = {
  future: (message = validationMessages.future): ValidationRule => ({
    validate: (value: Date) => value > new Date() || message,
  }),
  past: (message = validationMessages.past): ValidationRule => ({
    validate: (value: Date) => value < new Date() || message,
  }),
  minDate: (min: Date, message?: string): ValidationRule => ({
    validate: (value: Date) => 
      value >= min || message || validationMessages.min(Math.floor(min.getTime() / 86400000)),
  }),
  maxDate: (max: Date, message?: string): ValidationRule => ({
    validate: (value: Date) => 
      value <= max || message || validationMessages.max(Math.floor(max.getTime() / 86400000)),
  }),
} as const;

export const numberRules = {
  integer: (message = validationMessages.integer): ValidationRule => ({
    validate: (value: number) => Number.isInteger(value) || message,
  }),
  positive: (message = validationMessages.positive): ValidationRule => ({
    validate: (value: number) => value > 0 || message,
  }),
  range: (min: number, max: number): ValidationRule => ({
    min,
    max,
    validate: (value: number) =>
      (value >= min && value <= max) || `Must be between ${min} and ${max}`,
  }),
} as const;

// Utility type for creating form configurations
export type FormFieldConfig<T> = {
  [K in keyof T]: {
    type: string;
    label: string;
    rules?: ValidationRule;
    placeholder?: string;
  };
};

// Example usage:
// interface LoginForm {
//   email: string;
//   password: string;
// }
//
// const loginFormConfig: FormFieldConfig<LoginForm> = {
//   email: {
//     type: 'email',
//     label: 'Email',
//     rules: commonRules.email,
//   },
//   password: {
//     type: 'password',
//     label: 'Password',
//     rules: commonRules.password,
//   },
// };