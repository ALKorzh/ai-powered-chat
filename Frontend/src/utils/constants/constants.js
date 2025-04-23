import {z} from 'zod'

export const registrationSchema = z.object({
    username: z.string().min(4, 'Username must be at least 4 characters long'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
}).refine(data => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export const authorizationSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
})