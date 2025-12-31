import React, { useState, useCallback } from 'react';
import { apiCall } from '../services/apiService';

interface ValidationError {
  [key: string]: string;
}

interface UseFormValidationProps<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => ValidationError;
}

export const useFormValidation = <T>({
  initialValues,
  onSubmit,
  validate,
}: UseFormValidationProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: inputValue,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur if validate function exists
    if (validate) {
      const fieldErrors = validate({ ...values, [name]: e.target.value } as T);
      if (fieldErrors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name],
        }));
      }
    }
  }, [values, validate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate all fields
      if (validate) {
        const fieldErrors = validate(values);
        setErrors(fieldErrors);

        if (Object.keys(fieldErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
      }

      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, validate]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
};

interface UseApiProps<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export const useApi = <T,>({
  endpoint,
  method = 'GET',
  body,
  onSuccess,
  onError,
}: UseApiProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (customBody?: any) => {
    setLoading(true);
    setError(null);

    const { data: responseData, error: apiError } = await apiCall<T>(
      endpoint,
      method,
      customBody || body
    );

    if (apiError) {
      setError(apiError);
      onError?.(apiError);
    } else if (responseData) {
      setData(responseData);
      onSuccess?.(responseData);
    }

    setLoading(false);
    return { data: responseData, error: apiError };
  }, [endpoint, method, body, onSuccess, onError]);

  const refetch = useCallback(() => {
    if (method === 'GET') {
      return execute();
    }
  }, [method, execute]);

  return {
    data,
    error,
    loading,
    execute,
    refetch,
    setData,
    setError,
  };
};

// Common validation schemas
export const validationSchemas = {
  // Assessment answer validation
  validateAssessmentAnswers: (answers: any[], questions: any[]) => {
    const errors: ValidationError = {};

    answers.forEach((answer, index) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return;

      if (!answer.value && question.type !== 'file-upload') {
        errors[`answer-${index}`] = `Answer required for question ${index + 1}`;
      }

      if (question.type === 'short-answer' && answer.value.trim().length < 10) {
        errors[`answer-${index}`] = 'Answer must be at least 10 characters';
      }
    });

    return errors;
  },

  // File validation
  validateFile: (file: File | null, maxSizeMB: number = 10, allowedTypes: string[] = []) => {
    if (!file) return 'File is required';
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }
    return '';
  },

  // Form field validation
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Invalid email address';
  },

  validateRequired: (value: string, fieldName: string = 'Field') => {
    return value.trim() ? '' : `${fieldName} is required`;
  },

  validateMinLength: (value: string, min: number, fieldName: string = 'Field') => {
    return value.length >= min ? '' : `${fieldName} must be at least ${min} characters`;
  },

  validateMaxLength: (value: string, max: number, fieldName: string = 'Field') => {
    return value.length <= max ? '' : `${fieldName} must be at most ${max} characters`;
  },
};
