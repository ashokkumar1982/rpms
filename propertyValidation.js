import { z } from 'zod'

export const propertySchema = z.object({
  property_name: z.string().min(2, 'Property name is required'),
  property_number: z.string().min(1, 'Property number is required'),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^\d{6}$/.test(val), 'Pincode must be 6 digits'),
  owner_name: z.string().optional().or(z.literal('')),
  owner_mobile: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^\d{10}$/.test(val), 'Mobile must be 10 digits'),
  property_type: z.enum(['Apartment', 'Villa', 'Individual House', 'Commercial'], {
    errorMap: () => ({ message: 'Select a property type' }),
  }),
  rent: z.coerce.number().min(0, 'Rent must be 0 or more'),
  maintenance: z.coerce.number().min(0).default(0),
  eb_rate: z.coerce.number().min(0).default(0),
  deposit: z.coerce.number().min(0).default(0),
  status: z.enum(['Occupied', 'Vacant']),
  description: z.string().optional().or(z.literal('')),
})
