import { z } from "zod";

/** Validación de DNI/NIE español (formato + letra de control). */
const DNI_LETRAS = "TRWAGMYFPDXBNJZSQVHLCKE";
export const dniSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[0-9XYZ][0-9]{7}[A-Z]$/, "DNI/NIE no válido")
  .refine((dni) => {
    const map: Record<string, string> = { X: "0", Y: "1", Z: "2" };
    const num = parseInt((map[dni[0]] ?? dni[0]) + dni.slice(1, 8), 10);
    return DNI_LETRAS[num % 23] === dni[8];
  }, "La letra del DNI/NIE no es correcta");

export const ibanSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^ES[0-9]{22}$/, "IBAN español no válido (debe empezar por ES y tener 24 caracteres)");

/** Login: acepta DNI o email + contraseña. */
export const loginSchema = z.object({
  identificador: z.string().min(1, "Introduce tu DNI o email"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const recuperarPasswordSchema = z.object({
  email: z.string().email(),
});

export const nuevaPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirmar: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

/** Registro público de familia: tutor + hijo (alta de cantera). */
export const registroFamiliaSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio").max(100),
  apellidos: z.string().min(1, "Apellidos obligatorios").max(150),
  dni: dniSchema,
  email: z.string().email("Email no válido"),
  telefono: z.string().trim().min(9).max(15).optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  hijoNombre: z.string().min(1, "Nombre del jugador obligatorio").max(100),
  hijoApellidos: z.string().min(1, "Apellidos del jugador obligatorios").max(150),
  hijoFechaNacimiento: z.coerce.date(),
  equipo: z.string().min(1, "Indica el equipo o categoría").max(60),
});
export type RegistroFamiliaInput = z.infer<typeof registroFamiliaSchema>;

/** Alta/edición de jugador. */
export const jugadorSchema = z.object({
  nombre: z.string().min(1).max(100),
  apellidos: z.string().min(1).max(150),
  fechaNacimiento: z.coerce.date(),
  dorsal: z.number().int().min(1).max(99).optional(),
  equipoId: z.string().cuid().optional(),
});
export type JugadorInput = z.infer<typeof jugadorSchema>;

/** Registro de mandato SEPA por parte de la familia. */
export const mandatoSepaSchema = z.object({
  iban: ibanSchema,
  titular: z.string().min(1, "Nombre del titular obligatorio"),
});
export type MandatoSepaInput = z.infer<typeof mandatoSepaSchema>;

/** Creación de cuota por administración. */
export const cuotaSchema = z.object({
  jugadorId: z.string().cuid(),
  planId: z.string().cuid().optional(),
  periodo: z.string().regex(/^\d{4}-\d{2}$/, "Periodo con formato YYYY-MM"),
  concepto: z.string().min(1),
  importeCentimos: z.number().int().min(0),
});
export type CuotaInput = z.infer<typeof cuotaSchema>;

/** Formulario de contacto público. */
export const contactoSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  asunto: z.string().min(1),
  mensaje: z.string().min(10),
  consentimiento: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de privacidad" }),
  }),
});
export type ContactoInput = z.infer<typeof contactoSchema>;

/** Utilidad: formatea céntimos a euros. */
export function formatEuros(centimos: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    centimos / 100,
  );
}
