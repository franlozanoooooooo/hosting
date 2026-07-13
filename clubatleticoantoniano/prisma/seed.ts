import { PrismaClient, Rol, TipoEvento } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando datos de ejemplo...");

  // ───── Usuarios base (uno por rol) ─────
  const passwordHash = await argon2.hash("Antoniano2026!", { type: argon2.argon2id });

  const superAdmin = await prisma.usuario.upsert({
    where: { email: "admin@cantonioano.es" },
    update: {},
    create: { email: "admin@cantonioano.es", passwordHash, rol: Rol.SUPER_ADMIN },
  });

  const usuarioFamilia = await prisma.usuario.upsert({
    where: { dni: "12345678Z" },
    update: {},
    create: {
      email: "familia@example.com",
      dni: "12345678Z",
      passwordHash,
      rol: Rol.FAMILIA,
      tutor: {
        create: {
          nombre: "María",
          apellidos: "García López",
          dni: "12345678Z",
          telefono: "600111222",
          email: "familia@example.com",
        },
      },
    },
    include: { tutor: true },
  });

  // ───── Categorías y equipo ─────
  const alevin = await prisma.categoria.upsert({
    where: { nombre: "Alevín" },
    update: {},
    create: { nombre: "Alevín", edadMin: 10, edadMax: 11, orden: 4 },
  });

  const equipo = await prisma.equipo.upsert({
    where: { nombre_temporada: { nombre: "Alevín A", temporada: "2025/2026" } },
    update: {},
    create: { nombre: "Alevín A", temporada: "2025/2026", categoriaId: alevin.id },
  });

  // ───── Jugador vinculado a la familia ─────
  const jugador = await prisma.jugador.create({
    data: {
      nombre: "Lucas",
      apellidos: "García López",
      fechaNacimiento: new Date("2015-03-12"),
      dorsal: 10,
      equipoId: equipo.id,
      tutores: {
        create: {
          tutorId: usuarioFamilia.tutor!.id,
          parentesco: "MADRE",
          esContactoPrincipal: true,
        },
      },
    },
  });

  // ───── Plan de cuota + cuota pendiente ─────
  const plan = await prisma.planCuota.create({
    data: {
      nombre: "Cuota mensual Alevín 2025/26",
      categoriaId: alevin.id,
      importeCentimos: 4500,
      periodicidad: "MENSUAL",
      diaCobro: 5,
    },
  });

  await prisma.cuota.create({
    data: {
      jugadorId: jugador.id,
      planId: plan.id,
      periodo: "2026-06",
      concepto: "Cuota mensual junio",
      importeCentimos: 4500,
    },
  });

  // ───── Evento de calendario ─────
  await prisma.evento.create({
    data: {
      equipoId: equipo.id,
      tipo: TipoEvento.PARTIDO,
      titulo: "CAA Alevín A vs Rival CF",
      inicio: new Date("2026-06-14T11:00:00Z"),
      lugar: "Campo Municipal",
      rival: "Rival CF",
    },
  });

  // ───── Noticia destacada ─────
  const catNoticia = await prisma.categoriaNoticia.upsert({
    where: { slug: "primer-equipo" },
    update: {},
    create: { nombre: "Primer Equipo", slug: "primer-equipo" },
  });

  await prisma.noticia.upsert({
    where: { slug: "victoria-historica" },
    update: {},
    create: {
      slug: "victoria-historica",
      titulo: "Victoria histórica del Club Atlético Antoniano",
      extracto: "El primer equipo logra una victoria clave en casa.",
      cuerpo: "Crónica completa del partido...",
      destacada: true,
      publicada: true,
      publicadaEn: new Date(),
      categoriaId: catNoticia.id,
    },
  });

  console.log(`✅ Listo. Admin: ${superAdmin.email} · Familia DNI: 12345678Z · pass: Antoniano2026!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
