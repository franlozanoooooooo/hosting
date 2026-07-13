import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";

import { AuthModule } from "./modules/auth/auth.module";
import { JugadoresModule } from "./modules/jugadores/jugadores.module";
import { PagosModule } from "./modules/pagos/pagos.module";
import { AuditModule } from "./modules/audit/audit.module";
import { IaModule } from "./modules/ia/ia.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    // Configuración global (lee del .env raíz del monorepo).
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting: 100 peticiones por minuto y IP por defecto.
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    AuthModule,
    JugadoresModule,
    PagosModule,
    AuditModule,
    IaModule,
  ],
  controllers: [HealthController],
  providers: [
    // El orden importa: throttler → autenticación → autorización por rol.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Auditoría transversal de acciones.
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
