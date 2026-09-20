import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const coordinates = z.tuple([
  z.number().min(-180).max(180), // lng
  z.number().min(-90).max(90), // lat
]);

export const donorRegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(15),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bloodType: z.enum(BLOOD_TYPES),
  coordinates,
  city: z.string().optional(),
});

export const hospitalRegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(15),
  password: z.string().min(8),
  registrationNumber: z.string().min(3),
  address: z.string().optional(),
  coordinates,
  city: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["donor", "hospital"]),
});

export const createRequestSchema = z.object({
  patientInfo: z.string().max(200).optional(),
  bloodType: z.enum(BLOOD_TYPES),
  unitsNeeded: z.number().int().min(1).max(50),
  urgency: z.enum(["critical", "urgent", "scheduled"]).default("urgent"),
});

export const respondToMatchSchema = z.object({
  response: z.enum(["accepted", "declined"]),
});

export const updateDonorProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(7).max(15).optional(),
  city: z.string().max(80).optional(),
});

export const updateHospitalProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(7).max(15).optional(),
  address: z.string().max(200).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});