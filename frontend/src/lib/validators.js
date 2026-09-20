import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["donor", "hospital"]),
});

export const donorRegisterSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bloodType: z.enum(BLOOD_TYPES, { message: "Select a blood type" }),
  city: z.string().optional(),
});

export const hospitalRegisterSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  registrationNumber: z.string().min(3, "Enter a valid registration number"),
  address: z.string().optional(),
  city: z.string().optional(),
});

export const createRequestSchema = z.object({
  patientInfo: z.string().max(200).optional(),
  bloodType: z.enum(BLOOD_TYPES),
  unitsNeeded: z.coerce.number().int().min(1, "At least 1 unit").max(50),
  urgency: z.enum(["critical", "urgent", "scheduled"]),
});

export const BLOOD_TYPE_LIST = BLOOD_TYPES;

export const updateDonorProfileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().min(7, "Enter a valid phone number"),
  city: z.string().optional(),
});

export const updateHospitalProfileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().min(7, "Enter a valid phone number"),
  address: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });