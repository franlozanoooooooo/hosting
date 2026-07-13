/**
 * Crea (o actualiza) el usuario administrador. Pensado para producción:
 * no siembra datos de ejemplo, solo el admin.
 *
 * Uso: DATABASE_URL=<url> ADMIN_EMAIL=<email> ADMIN_PASSWORD=<pass> tsx prisma/crear-admin.ts
 */
import { PrismaClient, Rol } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD");
  }
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const admin = await prisma.usuario.upsert({
    where: { email },
    update: { passwordHash, rol: Rol.SUPER_ADMIN, activo: true },
    create: { email, passwordHash, rol: Rol.SUPER_ADMIN },
  });
  console.log(`✅ Admin listo: ${admin.email} (rol ${admin.rol})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
