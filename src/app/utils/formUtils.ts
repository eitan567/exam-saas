import * as yup from 'yup';

export type ValidationRule = {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  email?: boolean | string;
  url?: boolean | string;
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
};

export type FieldType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date';

export type FieldConfig = {
  type?: FieldType;
  label?: string;
  placeholder?: string;
  rules?: ValidationRule;
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
};

export type FormConfig<T extends Record<string, any>> = {
  [K in keyof T]: FieldConfig;
};

interface NumberSchema extends yup.NumberSchema {
  min(limit: number, message?: string): this;
  max(limit: number, message?: string): this;
}

interface StringSchema extends yup.StringSchema {
  min(limit: number, message?: string): this;
  max(limit: number, message?: string): this;
  matches(regex: RegExp, message?: string): this;
}

function isNumberSchema(schema: yup.AnySchema): schema is NumberSchema {
  return schema.type === 'number';
}

function isStringSchema(schema: yup.AnySchema): schema is StringSchema {
  return schema.type === 'string';
}

function applyValidationRules(schema: yup.AnySchema, rules: ValidationRule): yup.AnySchema {
  let result = schema;

  if (rules.required) {
    result = result.required(
      typeof rules.required === 'string' ? rules.required : 'This field is required'
    );
  }

  if (rules.min !== undefined) {
    if (isNumberSchema(result) || isStringSchema(result)) {
      result = result.min(
        Number(rules.min),
        typeof rules.min === 'string' ? rules.min : `Minimum value is ${rules.min}`
      );
    }
  }

  if (rules.max !== undefined) {
    if (isNumberSchema(result) || isStringSchema(result)) {
      result = result.max(
        Number(rules.max),
        typeof rules.max === 'string' ? rules.max : `Maximum value is ${rules.max}`
      );
    }
  }

  if (rules.minLength !== undefined && isStringSchema(result)) {
    result = result.min(
      Number(rules.minLength),
      typeof rules.minLength === 'string' ? rules.minLength : `Minimum length is ${rules.minLength}`
    );
  }

  if (rules.maxLength !== undefined && isStringSchema(result)) {
    result = result.max(
      Number(rules.maxLength),
      typeof rules.maxLength === 'string' ? rules.maxLength : `Maximum length is ${rules.maxLength}`
    );
  }

  if (rules.pattern && isStringSchema(result)) {
    result = result.matches(
      rules.pattern.value,
      rules.pattern.message
    );
  }

  if (rules.validate) {
    const validateFn = rules.validate;
    result = result.test(
      'custom',
      'Invalid value',
      async (value: any) => {
        const result = await validateFn(value);
        return typeof result === 'string' ? false : result;
      }
    );
  }

  return result;
}

export function createYupSchema<T extends Record<string, any>>(config: FormConfig<T>): yup.ObjectSchema<any> {
  const schema: Record<string, yup.AnySchema> = {};

  (Object.entries(config) as [keyof T, FieldConfig][]).forEach(([field, fieldConfig]) => {
    let fieldSchema: yup.AnySchema;

    if (fieldConfig.rules) {
      const { rules } = fieldConfig;

      // Handle type-specific validation
      switch (fieldConfig.type) {
        case 'email':
          fieldSchema = yup.string().email(
            (rules.email as string) || 'Invalid email address'
          );
          break;
        case 'number':
          fieldSchema = yup.number();
          break;
        case 'date':
          fieldSchema = yup.date();
          break;
        case 'url':
          fieldSchema = yup.string().url(
            (rules.url as string) || 'Invalid URL'
          );
          break;
        default:
          fieldSchema = yup.string();
      }

      fieldSchema = applyValidationRules(fieldSchema, rules);
    } else {
      fieldSchema = yup.string();
    }

    schema[field as string] = fieldSchema;
  });

  return yup.object().shape(schema);
}

export function getInitialValues<T extends Record<string, any>>(config: FormConfig<T>): Partial<T> {
  return Object.entries(config).reduce((values, [field, fieldConfig]) => ({
    ...values,
    [field]: fieldConfig.defaultValue ?? '',
  }), {} as Partial<T>);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export type ParsedFormValue = string | number | boolean | ParsedFormObject | ParsedFormArray;

export interface ParsedFormObject {
  [key: string]: ParsedFormValue;
}

export type ParsedFormArray = ParsedFormValue[];

export function parseFormData(formData: FormData): ParsedFormObject {
  const data: ParsedFormObject = {};
  
  formData.forEach((value, key) => {
    const parts = key.match(/([^\[]+)(?:\[(\d+)\])?(?:\.(.+))?/);
    if (parts) {
      const [, field, index, subfield] = parts;
      if (index !== undefined) {
        if (!Array.isArray(data[field])) {
          data[field] = [] as ParsedFormArray;
        }
        const arr = data[field] as ParsedFormArray;
        if (subfield) {
          if (!arr[Number(index)]) {
            arr[Number(index)] = {} as ParsedFormObject;
          }
          ((arr[Number(index)] as ParsedFormObject))[subfield] = value.toString();
        } else {
          arr[Number(index)] = value.toString();
        }
      } else {
        data[field] = value.toString();
      }
    }
  });
  
  return data;
}