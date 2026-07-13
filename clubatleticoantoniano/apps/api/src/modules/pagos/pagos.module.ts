import { Module } from "@nestjs/common";

import { PagosController } from "./pagos.controller";
import { WebhooksController } from "./webhooks.controller";
import { PagosService } from "./pagos.service";
import { GoCardlessService } from "./gocardless.service";

@Module({
  controllers: [PagosController, WebhooksController],
  providers: [PagosService, GoCardlessService],
  exports: [PagosService],
})
export class PagosModule {}
