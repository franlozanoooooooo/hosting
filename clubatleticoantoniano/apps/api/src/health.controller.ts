import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

/** Endpoint público de salud para healthchecks de la plataforma (Railway). */
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  health() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
