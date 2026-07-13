import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { prisma, EstadoCuota, EstadoMandato } from "@caa/db";
import { ROLES, cuotaSchema, mandatoSepaSchema, type Rol } from "@caa/shared";

import type { AuthUser } from "../../common/decorators/current-user.decorator";
import { GoCardlessService } from "./gocardless.service";

@Injectable()
export class PagosService {
  constructor(private readonly gocardless: GoCardlessService) {}

  /** Cuotas visibles para el usuario: FAMILIA solo las de sus hijos. */
  async listarCuotas(user: AuthUser) {
    if (this.esAdmin(user.rol)) {
      return prisma.cuota.findMany({
        orderBy: { periodo: "desc" },
        include: { jugador: { select: { nombre: true, apellidos: true } } },
      });
    }
    const tutor = await this.tutorDe(user);
    if (!tutor) return [];
    return prisma.cuota.findMany({
      where: { jugador: { tutores: { some: { tutorId: tutor.id } } } },
      orderBy: { periodo: "desc" },
      include: { jugador: { select: { nombre: true, apellidos: true } } },
    });
  }

  /** Devuelve una URL firmada temporal para descargar el recibo PDF de una cuota. */
  async reciboUrl(cuotaId: string, user: AuthUser): Promise<{ url: string }> {
    const cuota = await prisma.cuota.findUnique({
      where: { id: cuotaId },
      include: { jugador: { include: { tutores: true } }, pagos: true },
    });
    if (!cuota) throw new NotFoundException("Cuota no encontrada");

    if (!this.esAdmin(user.rol)) {
      const tutor = await this.tutorDe(user);
      const suyo = tutor && cuota.jugador.tutores.some((t) => t.tutorId === tutor.id);
      if (!suyo) throw new ForbiddenException("No puedes acceder a este recibo");
    }
    // TODO: generar/recuperar PDF de storage y firmar URL temporal (15 min).
    return { url: `https://storage.local/recibos/${cuotaId}.pdf?firma=stub` };
  }

  /** FAMILIA registra su mandato SEPA → inicia el redirect flow de GoCardless. */
  async iniciarMandato(body: unknown, user: AuthUser) {
    const data = mandatoSepaSchema.parse(body); // valida IBAN ES + titular
    const tutor = await this.tutorDe(user);
    if (!tutor) throw new ForbiddenException("Solo las familias registran mandatos");

    const flow = await this.gocardless.crearRedirectFlow({
      tutorId: tutor.id,
      titular: data.titular,
      successUrl: `${process.env.WEB_ORIGIN}/intranet/pagos/mandato/ok`,
    });

    // Guardamos el mandato en estado PENDIENTE; solo persistimos los últimos 4
    // dígitos del IBAN, nunca el IBAN completo (lo custodia GoCardless).
    await prisma.mandatoSepa.create({
      data: {
        tutorId: tutor.id,
        titular: data.titular,
        ibanLast4: data.iban.slice(-4),
        estado: EstadoMandato.PENDIENTE,
      },
    });
    return {
      redirectUrl: flow.redirectUrl,
      redirectFlowId: flow.redirectFlowId,
      esReal: flow.esReal,
    };
  }

  /**
   * FAMILIA confirma el mandato a la vuelta de GoCardless (redirect flow
   * completado). Activa el mandato y guarda el id del proveedor; las cuotas
   * pendientes del tutor quedan vinculadas para el cobro por remesa.
   */
  async confirmarMandato(redirectFlowId: string, user: AuthUser) {
    const tutor = await this.tutorDe(user);
    if (!tutor) throw new ForbiddenException("Solo las familias confirman mandatos");

    const pendiente = await prisma.mandatoSepa.findFirst({
      where: { tutorId: tutor.id, estado: EstadoMandato.PENDIENTE },
      orderBy: { createdAt: "desc" },
    });
    if (!pendiente) throw new NotFoundException("No hay ningún mandato pendiente");

    const resultado = await this.gocardless.completarRedirectFlow(
      redirectFlowId,
      tutor.id,
    );

    const mandato = await prisma.mandatoSepa.update({
      where: { id: pendiente.id },
      data: {
        providerMandateId: resultado.mandateId,
        estado: EstadoMandato.ACTIVO,
        firmadoEn: new Date(),
        // En modo real, GoCardless nos da los últimos 4 reales de la cuenta.
        ...(resultado.ibanLast4 ? { ibanLast4: resultado.ibanLast4 } : {}),
      },
    });

    // Vincula al mandato las cuotas pendientes de los hijos del tutor.
    await prisma.cuota.updateMany({
      where: {
        estado: EstadoCuota.PENDIENTE,
        mandatoId: null,
        jugador: { tutores: { some: { tutorId: tutor.id } } },
      },
      data: { mandatoId: mandato.id },
    });

    return {
      id: mandato.id,
      ibanLast4: mandato.ibanLast4,
      titular: mandato.titular,
      estado: mandato.estado,
      firmadoEn: mandato.firmadoEn,
    };
  }

  /** ADMIN crea una cuota individual. */
  async crearCuota(body: unknown) {
    const data = cuotaSchema.parse(body);
    return prisma.cuota.create({ data });
  }

  /**
   * ADMIN genera una remesa: agrupa todas las cuotas PENDIENTE en una remesa
   * y las marca EN_REMESA para su cobro mensual conjunto (modelo SEPA español).
   */
  async generarRemesa(referencia: string, fechaCobro: Date) {
    return prisma.$transaction(async (tx) => {
      const pendientes = await tx.cuota.findMany({
        where: { estado: EstadoCuota.PENDIENTE, mandatoId: { not: null } },
        select: { id: true, importeCentimos: true },
      });
      const total = pendientes.reduce((s, c) => s + c.importeCentimos, 0);

      const remesa = await tx.remesa.create({
        data: { referencia, fechaCobro, totalCentimos: total, estado: "ENVIADA" },
      });
      await tx.cuota.updateMany({
        where: { id: { in: pendientes.map((c) => c.id) } },
        data: { estado: EstadoCuota.EN_REMESA, remesaId: remesa.id },
      });
      return { remesaId: remesa.id, cuotas: pendientes.length, totalCentimos: total };
    });
  }

  /** ADMIN consulta los impagos (cuotas devueltas/impagadas). */
  async listarImpagos() {
    return prisma.cuota.findMany({
      where: { estado: { in: [EstadoCuota.IMPAGADA, EstadoCuota.DEVUELTA] } },
      include: { jugador: { select: { nombre: true, apellidos: true } } },
      orderBy: { periodo: "desc" },
    });
  }

  private esAdmin(rol: Rol): boolean {
    return rol !== ROLES.FAMILIA;
  }

  private tutorDe(user: AuthUser) {
    return prisma.tutor.findUnique({ where: { usuarioId: user.sub }, select: { id: true } });
  }
}
