import { Global, Module } from "@nestjs/common";
import { AuditService } from "./audit.service";

/**
 * Módulo global de auditoría: `AuditService` queda disponible en toda la app
 * sin necesidad de reimportarlo en cada módulo.
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
