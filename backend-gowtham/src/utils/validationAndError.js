/**
 * VALIDATION & ERROR HANDLING
 * Comprehensive validation utilities and custom error handlers
 */

// Custom error class
class APIError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const errors = {};

    // Validate request body
    if (req.body && schema) {
      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];

        if (rules.required && (value === undefined || value === null || value === "")) {
          errors[field] = `${field} is required`;
          continue;
        }

        if (value === undefined || value === null) continue;

        // Type validation
        if (rules.type) {
          const actualType = Array.isArray(value) ? "array" : typeof value;
          if (actualType !== rules.type) {
            errors[field] = `${field} must be of type ${rules.type}`;
          }
        }

        // String validations
        if (rules.type === "string" && typeof value === "string") {
          if (rules.minLength && value.length < rules.minLength) {
            errors[field] = `${field} must be at least ${rules.minLength} characters`;
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors[field] = `${field} must not exceed ${rules.maxLength} characters`;
          }
          if (rules.pattern && !rules.pattern.test(value)) {
            errors[field] = `${field} format is invalid`;
          }
        }

        // Number validations
        if (rules.type === "number" && typeof value === "number") {
          if (rules.min !== undefined && value < rules.min) {
            errors[field] = `${field} must be at least ${rules.min}`;
          }
          if (rules.max !== undefined && value > rules.max) {
            errors[field] = `${field} must not exceed ${rules.max}`;
          }
        }

        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
          errors[field] = `${field} must be one of: ${rules.enum.join(", ")}`;
        }

        // Custom validation function
        if (rules.validate && !rules.validate(value)) {
          errors[field] = rules.validateMessage || `${field} validation failed`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Validation error",
        validationErrors: errors,
      });
    }

    next();
  };
};

// Validation schemas
const validationSchemas = {
  updateProgress: {
    courseId: { required: true, type: "string" },
    percentage: {
      required: true,
      type: "number",
      min: 0,
      max: 100,
    },
    lessonId: { type: "string" },
    timeSpent: { type: "number", min: 0 },
    completed: { type: "boolean" },
  },

  submitAssessment: {
    assessmentId: { required: true, type: "string" },
    score: { required: true, type: "number", min: 0 },
    totalScore: { required: true, type: "number", min: 0 },
    answers: { type: "array" },
    timeTaken: { type: "number", min: 0 },
  },

  createAssessment: {
    courseId: { required: true, type: "string" },
    title: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    type: {
      required: true,
      type: "string",
      enum: ["quiz", "test", "assignment", "project"],
    },
    totalQuestions: { type: "number", min: 0 },
    passingScore: {
      type: "number",
      min: 0,
      max: 100,
    },
  },

  generateCertificate: {
    userId: { required: true, type: "string" },
    courseId: { required: true, type: "string" },
  },

  verifyCertificate: {
    certificateId: { required: true, type: "string" },
  },

  revokeCertificate: {
    certificateId: { required: true, type: "string" },
    reason: { type: "string" },
  },

  bulkCheckEligibility: {
    courseId: { required: true, type: "string" },
    userIds: {
      required: true,
      type: "array",
      validate: (val) => Array.isArray(val) && val.length > 0,
      validateMessage: "userIds must be a non-empty array",
    },
  },
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      timestamp: err.timestamp,
    });
  }

  if (err.name === "FirebaseError") {
    return res.status(400).json({
      error: "Firebase operation failed",
      message: err.message,
      code: err.code,
    });
  }

  if (err.message.includes("Validation error")) {
    return res.status(400).json({
      error: "Validation error",
      message: err.message,
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "An error occurred",
    timestamp: new Date(),
  });
};

// Try-catch wrapper for async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.uid || "anonymous",
    });
  });

  next();
};

// Rate limiting helper
const createRateLimiter = (windowMs = 60000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user?.uid || req.ip;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    // Clean old requests
    const userRequests = requests.get(key).filter((time) => now - time < windowMs);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil(
          (userRequests[0] + windowMs - now) / 1000
        ),
      });
    }

    userRequests.push(now);
    requests.set(key, userRequests);
    next();
  };
};

// Data sanitization
const sanitizeInput = (data) => {
  if (typeof data === "string") {
    return data.trim().replace(/[<>]/g, "");
  }
  if (typeof data === "object" && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return data;
};

// Audit logging
const auditLog = async (userId, action, resource, status, details = {}) => {
  // This would typically write to a database
  console.log({
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    status,
    details,
  });
};

module.exports = {
  APIError,
  validateInput,
  validationSchemas,
  errorHandler,
  asyncHandler,
  requestLogger,
  createRateLimiter,
  sanitizeInput,
  auditLog,
};
