const { z } = require('zod');

exports.registerSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    // role defaults to 'customer' in the controller if not provided
    role: z.enum(['customer', 'contractor']).default('customer'),
  })
});

// Contractor profile (companyName, panCard, etc.) is collected
// in a separate onboarding step AFTER registration.

exports.loginSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone number is required'),
    password: z.string().min(1, 'Password is required')
  })
});
