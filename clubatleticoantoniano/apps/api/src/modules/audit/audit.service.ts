import { Injectable, Logger } from "@nestjs/common";
import { prisma } from "@caa/db";

export interface AuditEntry {
  usuarioId?: string | null;
  accion: string;
  entidad?: string;
  entidadId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Servicio de auditoría reutilizable. Permite registrar acciones de negocio
 * de forma explícita desde los servicios (login, ver documento, crear remesa…),
 * complementando al `AuditInterceptor` transversal.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          usuarioId: entry.usuarioId ?? null,
          accion: entry.accion,
          entidad: entry.entidad,
          entidadId: entry.entidadId,
          ip: entry.ip,
          userAgent: entry.userAgent,
          metadata: entry.metadata as object | undefined,
        },
      });
    } catch (err: unknown) {
      // La auditoría nunca debe propagar errores al flujo principal.
      this.logger.error(`Fallo al registrar auditoría (${entry.accion}): ${String(err)}`);
    }
  }
}
