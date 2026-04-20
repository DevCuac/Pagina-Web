import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(20, 'Máximo 20 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  minecraftName: z.string().min(3, 'El nombre de Minecraft debe tener al menos 3 caracteres').max(16, 'Máximo 16 caracteres').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const forumPostSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200, 'Máximo 200 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío').max(5000, 'Máximo 5000 caracteres'),
});

export const ticketSchema = z.object({
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres').max(200, 'Máximo 200 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export const ticketMessageSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío').max(5000, 'Máximo 5000 caracteres'),
});

export const profileSchema = z.object({
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  minecraftName: z.string().min(3).max(16).optional(),
});

export const roleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color hexadecimal inválido'),
  weight: z.number().int().min(0),
  isStaff: z.boolean(),
  isAdmin: z.boolean(),
});

export const gameModeSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  icon: z.string().optional(),
  image: z.string().optional(),
});

export const serverSchema = z.object({
  name: z.string().min(2),
  host: z.string().min(2),
  port: z.number().int().min(1).max(65535),
  gameModeId: z.string().optional(),
  isMain: z.boolean(),
});

export const wikiPageSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  content: z.string().min(10),
  summary: z.string().optional(),
  gameModeId: z.string().optional(),
});
