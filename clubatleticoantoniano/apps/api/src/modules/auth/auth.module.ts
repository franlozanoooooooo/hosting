import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

// Global para que `JwtService` esté disponible en el `JwtAuthGuard` registrado
// como guard global en `AppModule`.
@Global()
@Module({
  // Registramos JwtModule sin secreto global: cada firma/verificación indica
  // explícitamente el secreto (access vs refresh) para usar claves distintas.
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
