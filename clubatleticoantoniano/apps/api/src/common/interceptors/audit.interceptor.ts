import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { prisma } from "@caa/db";

import type { AuthUser } from "../decorators/current-user.decorator";

/**
 * Interceptor de auditoría. Tras una mutación exitosa (POST/PUT/PATCH/DELETE)
 * registra una entrada en `audit_log`. Las lecturas (GET) no se auditan aquí
 * para no inundar la tabla; el acceso a datos sensibles se audita de forma
 * explícita en los servicios (p. ej. ver documento).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const method = req.method.toUpperCase();
    const esMutacion = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

    return next.handle().pipe(
      tap(() => {
        if (!esMutacion) return;

        const accion = `${method} ${req.originalUrl ?? req.url}`;
        const ip = (req.headers["x-forwarded-for"] as string) ?? req.ip ?? null;
        const userAgent = req.headers["user-agent"] ?? null;

        // Fire-and-forget: la auditoría no debe bloquear ni romper la respuesta.
        prisma.auditLog
          .create({
            data: {
              usuarioId: req.user?.sub ?? null,
              accion,
              ip: ip ?? undefined,
              userAgent: userAgent ?? undefined,
            },
          })
          .catch((err: unknown) => {
            this.logger.error(`No se pudo registrar auditoría: ${String(err)}`);
          });
      }),
    );
  }
}
