import { ValidationError } from 'yup';

export type FieldError = string | null;

export interface FormErrors {
  [key: string]: FieldError | NestedFormErrors;
}

export interface NestedFormErrors {
  [key: string]: FormErrors | FieldError;
}

export interface APIError {
  field?: string;
  message: string;
  code?: string;
}

export class FormErrorHandler {
  private static formatPath(path: string): string {
    return path.replace(/\[(\d+)\]/g, '.$1');
  }

  private static setNestedError(
    errors: FormErrors,
    path: string[],
    error: FieldError
  ): void {
    let current = errors;
    const lastIndex = path.length - 1;

    path.forEach((key, index) => {
      if (index === lastIndex) {
        current[key] = error;
      } else {
        current[key] = current[key] || {};
        current = current[key] as FormErrors;
      }
    });
  }

  static fromYupError(error: ValidationError): FormErrors {
    const errors: FormErrors = {};

    error.inner.forEach((err) => {
      if (err.path) {
        const path = this.formatPath(err.path).split('.');
        this.setNestedError(errors, path, err.message);
      }
    });

    return errors;
  }

  static fromAPIErrors(apiErrors: APIError[]): FormErrors {
    const errors: FormErrors = {};

    apiErrors.forEach((error) => {
      if (error.field) {
        const path = this.formatPath(error.field).split('.');
        this.setNestedError(errors, path, error.message);
      } else {
        errors._global = error.message;
      }
    });

    return errors;
  }

  static getFieldError(errors: FormErrors, field: string): FieldError {
    const path = this.formatPath(field).split('.');
    let current: any = errors;

    for (const key of path) {
      if (current === null || typeof current !== 'object') {
        return null;
      }
      current = current[key];
    }

    return typeof current === 'string' ? current : null;
  }

  static hasErrors(errors: FormErrors): boolean {
    return Object.keys(errors).length > 0;
  }

  static getAllErrors(errors: FormErrors): string[] {
    const allErrors: string[] = [];

    const extractErrors = (obj: FormErrors | FieldError, prefix = ''): void => {
      if (typeof obj === 'string' && obj) {
        allErrors.push(prefix ? `${prefix}: ${obj}` : obj);
      } else if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          extractErrors(value, newPrefix);
        });
      }
    };

    extractErrors(errors);
    return allErrors;
  }

  static summarizeErrors(errors: FormErrors): string {
    const allErrors = this.getAllErrors(errors);
    return allErrors.length > 0
      ? `Please fix the following errors:\n${allErrors.join('\n')}`
      : '';
  }

  static isFieldTouched(touched: Record<string, boolean>, field: string): boolean {
    const path = this.formatPath(field).split('.');
    let current: any = touched;

    for (const key of path) {
      if (current === null || typeof current !== 'object') {
        return false;
      }
      current = current[key];
    }

    return Boolean(current);
  }
}

export function createErrorMap(errors: APIError[]): Map<string, string> {
  const errorMap = new Map<string, string>();
  
  errors.forEach((error) => {
    if (error.field) {
      errorMap.set(error.field, error.message);
    } else {
      errorMap.set('_global', error.message);
    }
  });

  return errorMap;
}

// Example usage:
// try {
//   await validationSchema.validate(formData, { abortEarly: false });
// } catch (error) {
//   if (error instanceof ValidationError) {
//     const formErrors = FormErrorHandler.fromYupError(error);
//     console.log(FormErrorHandler.summarizeErrors(formErrors));
//     
//     // Get specific field error
//     const emailError = FormErrorHandler.getFieldError(formErrors, 'email');
//     
//     // Get nested field error
//     const addressError = FormErrorHandler.getFieldError(
//       formErrors,
//       'addresses[0].street'
//     );
//   }
// }
//
// // Handle API errors
// const apiErrors: APIError[] = [
//   { field: 'email', message: 'Email already exists', code: 'DUPLICATE' },
//   { message: 'Server error', code: 'INTERNAL' }
// ];
//
// const formErrors = FormErrorHandler.fromAPIErrors(apiErrors);
// const errorMap = createErrorMap(apiErrors);